# Hostifer — System Sequence Diagrams

Four diagrams covering the full platform flow from authentication to
cold-start traffic handling.

---

## Diagram 1 — Deployment Trigger Flow

From the user submitting the deploy form to Argo Workflow being submitted
and the DB record being created.

```mermaid
sequenceDiagram
    autonumber

    actor U as 👤 User
    participant W as 🌐 DeployWizard<br/>(Next.js Client)
    participant SA as ⚙️ Server Actions<br/>(Next.js Server)
    participant DB as 🗄️ PostgreSQL<br/>(Prisma)
    participant GH as 🐙 GitHub API
    participant ARGO as 🔄 Argo Workflows<br/>(REST API)

    U->>W: Paste GitHub repo URL
    W->>SA: validateRepo(repoUrl)
    SA->>GH: GET /repos/{owner}/{repo}
    GH-->>SA: repo metadata + branches
    SA->>GH: GET /repos/{owner}/{repo}/contents
    GH-->>SA: file tree for framework detection
    SA-->>W: { valid, framework, branches, stars }
    W-->>U: Show framework badge + branch selector

    U->>W: Fill service name → click Continue
    W->>SA: createProject({ name, repoUrl, framework, port })
    SA->>SA: requireAuth() — validate session
    SA->>DB: INSERT Project { slug, repoUrl, framework, status=ACTIVE }
    DB-->>SA: { projectId }
    SA-->>W: { projectId }
    W-->>U: Advance to Step 2 (config)

    U->>W: Set region, plan, env vars → click Deploy
    W->>SA: updateProjectSettings(projectId, { region, planId, envVars })
    SA->>SA: requireProjectAccess(projectId)
    SA->>SA: encrypt each env var value (AES-256-GCM)
    SA->>DB: UPSERT EnvVar[], UPDATE Project { region, planId }
    DB-->>SA: ok

    W->>SA: triggerDeployment(projectId)
    SA->>SA: generateTenantId(slug) → e.g. myapp-4u1sl1f
    SA->>SA: generateImageName(tenantId) → 192.168.0.121:32000/myapp-4u1sl1f:latest
    SA->>DB: INSERT Deployment { status=QUEUED, imageName }
    SA->>DB: INSERT DeploymentStep x3 { BUILD, PROVISION, DNS — all PENDING }
    DB-->>SA: { deploymentId }

    SA->>ARGO: POST /api/v1/workflows/hostifer-system<br/>{ workflowTemplateRef: hostifer-deploy, parameters }
    ARGO-->>SA: { metadata.name: hostifer-deploy-rf42z }

    SA->>DB: UPDATE Deployment { status=BUILDING, workflowName }
    SA->>DB: UPDATE DeploymentStep BUILD { status=RUNNING }
    SA-->>W: { deploymentId, workflowName }
    W-->>U: Advance to Step 3 (build logs)

    note over U,ARGO: Workflow is now running in the cluster
```

---

## Diagram 2 — Argo Workflow Execution (Build → Provision → DNS)

What happens inside the cluster after the workflow is submitted.

```mermaid
sequenceDiagram
    autonumber

    participant ARGO as 🔄 Argo Controller
    participant BJ as 🔨 Build Job Pod<br/>(Go binary)
    participant BKIT as ⚙️ Buildkitd<br/>(Deployment)
    participant REG as 📦 Local Registry<br/>(:32000)
    participant PJ as 📋 Provision Job Pod<br/>(alpine/helm)
    participant K8S as ☸️ Kubernetes API
    participant DJ as 🌐 DNS Job Pod<br/>(Go binary)
    participant CF as ☁️ Cloudflare API

    ARGO->>BJ: Schedule Build step pod
    BJ->>BJ: git clone --depth 1 {REPO_URL}
    BJ->>BJ: railpack prepare → railpack-plan.json
    BJ->>BJ: patch plan: user=1000, chown /app
    BJ->>BKIT: Connect tcp://buildkitd:1234<br/>Solve({ frontend: railpack-frontend, context })
    BKIT->>BKIT: Pull railpack-builder image
    BKIT->>BKIT: npm ci + npm run build
    BKIT->>REG: Push image → 192.168.0.121:32000/myapp-4u1sl1f:latest
    REG-->>BKIT: 200 OK
    BKIT-->>BJ: Solve complete
    BJ-->>ARGO: Exit 0 ✅

    ARGO->>PJ: Schedule Provision step pod
    PJ->>PJ: helm registry login ghcr.io
    PJ->>K8S: helm install myapp-4u1sl1f<br/>oci://ghcr.io/.../tenant-chart<br/>--set tenant.id, subdomain, image, port
    K8S->>K8S: CREATE Namespace tenant-myapp-4u1sl1f
    K8S->>K8S: CREATE ResourceQuota + LimitRange
    K8S->>K8S: CREATE NetworkPolicy x4
    K8S->>K8S: CREATE ServiceAccount
    K8S->>K8S: CREATE Deployment { image, replicas=1 }
    K8S->>K8S: CREATE Service ClusterIP
    K8S->>K8S: CREATE IngressRoute (Traefik)
    K8S-->>PJ: helm install succeeded
    PJ-->>ARGO: Exit 0 ✅

    ARGO->>DJ: Schedule DNS step pod
    DJ->>CF: CreateDNSRecord { type=CNAME, name=myapp, content=tunnel.CNAME }
    CF-->>DJ: DNS record created
    DJ->>CF: GetTunnelConfiguration(tunnelID)
    CF-->>DJ: current ingress rules
    DJ->>CF: UpdateTunnelConfiguration — prepend myapp.hostifer.me → traefik
    CF-->>DJ: tunnel config updated
    DJ-->>ARGO: Exit 0 ✅

    ARGO-->>ARGO: Workflow phase = Succeeded
    note over ARGO,CF: Total pipeline: Build (~3-5min) → Provision (~30s) → DNS (~5s)
```

---

## Diagram 3 — Real-Time Log Streaming Flow

How build logs travel from the Go builder pod to the user's browser.

```mermaid
sequenceDiagram
    autonumber

    actor U as 👤 User Browser
    participant SB as 📺 StepBuild<br/>(React Client)
    participant API as 🔌 SSE Route<br/>/api/deployments/[id]/logs
    participant LC as 📡 LokiClient<br/>(lib/loki-client.ts)
    participant LOKI as 🗃️ Loki<br/>(log storage)
    participant PT as 🔍 Promtail<br/>(DaemonSet)
    participant BJ as 🔨 Build Pod<br/>(stdout JSON logs)
    participant SA as ⚙️ syncDeploymentStatus<br/>(Server Action)
    participant ARGO as 🔄 Argo API

    note over BJ,PT: Log collection side (continuous)
    BJ->>BJ: log.Info("npm ci", stream="buildkit")
    BJ-->>PT: stdout JSON line written to node log file
    PT->>PT: Scrape /var/log/pods/**/*.log
    PT->>PT: Attach labels: build_id, tenant_id, log_type=build
    PT->>LOKI: POST /loki/api/v1/push { streams }
    LOKI-->>PT: 204 No Content

    note over U,LOKI: Log delivery side (on user connection)
    U->>SB: Render StepBuild component
    SB->>API: new EventSource(/api/deployments/{id}/logs)
    API->>API: requireAuth() + verify project ownership
    API->>LC: streamBuildLogs(workflowName, onLine, signal)

    loop Every 2 seconds until signal aborted
        LC->>LOKI: GET /loki/api/v1/query_range<br/>query={build_id="hostifer-deploy-rf42z"}<br/>start={lastTimestampNs}, direction=forward
        LOKI-->>LC: { streams: [{ values: [[ts, logLine]] }] }
        LC->>LC: parseLokiLine() — strip k8s prefix<br/>parse inner JSON, filter non-builder lines
        LC->>API: onLine(LogLine)
        API->>SB: data: {"level":"info","msg":"npm ci","stream":"buildkit"}\n\n
        SB->>SB: setLogs(prev => [...prev, line])
        SB-->>U: Render new log line in terminal UI
    end

    note over SB,ARGO: Status polling side (parallel, every 3s)
    loop Every 3 seconds
        SB->>SA: syncDeploymentStatus(deploymentId)
        SA->>ARGO: GET /api/v1/workflows/hostifer-system/{workflowName}
        ARGO-->>SA: { phase, startedAt, finishedAt, nodes }
        SA->>SA: Map Argo phases → DeploymentStatus enum
        SA->>SA: UPDATE Deployment { status, startedAt, completedAt, buildDuration }
        SA->>SA: UPDATE DeploymentStep x3 { status, startedAt, completedAt }
        SA-->>SB: { status, steps[], deployedUrl }
        SB->>SB: Update pipeline step indicators
    end

    note over SB,U: On workflow completion
    SA->>SA: Fetch latest commit from GitHub API
    SA->>SA: UPDATE Deployment { commitSha, commitMessage }
    SB->>SB: status === LIVE → clearInterval + es.close()
    SB->>SB: onComplete(deployedUrl)
    SB-->>U: Advance to StepSuccess 🎉
```

---

## Diagram 4 — Tenant Traffic & Cold Start Flow (KEDA)

How incoming user traffic is handled for live tenants including cold start
for free tier (scaled-to-zero) deployments.

```mermaid
sequenceDiagram
    autonumber

    actor V as 🌍 Visitor
    participant CF as ☁️ Cloudflare<br/>(Tunnel)
    participant TR as 🔀 Traefik<br/>(Ingress)
    participant KEDA as ❄️ KEDA HTTP<br/>Interceptor
    participant K8S as ☸️ Kubernetes API
    participant POD as 📦 Tenant Pod<br/>(user app)
    participant CTRL as 🎮 KEDA Controller

    note over V,POD: Warm path — paid tier or already running
    V->>CF: GET https://myapp.hostifer.me/
    CF->>TR: Forward via Cloudflared tunnel
    TR->>TR: Match IngressRoute Host rule
    TR->>POD: Proxy to tenant-svc:80
    POD-->>TR: HTTP 200 response
    TR-->>CF: Response
    CF-->>V: Page rendered ✅

    note over V,CTRL: Cold start path — free tier, pod scaled to zero
    V->>CF: GET https://freeapp.hostifer.me/
    CF->>TR: Forward via tunnel
    TR->>KEDA: Proxy to HTTPScaledObject interceptor
    KEDA->>KEDA: Check backend health → 0 replicas, connection refused

    KEDA->>K8S: PATCH Deployment { replicas: 0 → 1 }
    K8S-->>KEDA: Deployment updated

    note over KEDA,V: Hold connection — show waking up page
    KEDA-->>V: 200 HTML splash page<br/>"Waking up your app..."

    loop Poll readiness every 500ms
        KEDA->>K8S: GET /readyz for tenant pod
        K8S-->>KEDA: 503 (pod starting)
    end

    K8S->>POD: Schedule + pull image from local registry
    POD->>POD: App startup (2-8s depending on runtime)
    POD-->>K8S: Readiness probe HTTP 200

    KEDA->>POD: Forward original request
    POD-->>KEDA: HTTP 200 response
    KEDA-->>TR: Response
    TR-->>CF: Response
    CF-->>V: Page rendered ✅ (after cold start delay)

    note over CTRL,K8S: Scale-down side (background, continuous)
    loop Every 30s check
        CTRL->>CTRL: Check HTTPScaledObject metrics<br/>no requests in last 15 min?
        CTRL->>K8S: PATCH Deployment { replicas: 1 → 0 }
        K8S->>POD: Graceful SIGTERM → pod stops
        note over K8S: 0 CPU, 0 memory consumed 💤
    end
```