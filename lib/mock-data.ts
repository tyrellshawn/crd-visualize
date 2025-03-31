"use client"

// Mock data for CRDs
export const getMockCrds = () => {
  return [
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "applications.app.k8s.io",
        uid: "crd-1",
        creationTimestamp: "2023-01-01T00:00:00Z",
        annotations: {
          cluster: "production",
        },
      },
      spec: {
        group: "app.k8s.io",
        names: {
          kind: "Application",
          plural: "applications",
          singular: "application",
          shortNames: ["app"],
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1beta1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      configMapRef: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                        },
                      },
                      secretRef: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                        },
                      },
                      serviceName: { type: "string" },
                      kafkaTopicRef: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          cluster: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "ingressroutes.traefik.containo.us",
        uid: "crd-2",
        creationTimestamp: "2023-01-02T00:00:00Z",
        annotations: {
          cluster: "production",
        },
      },
      spec: {
        group: "traefik.containo.us",
        names: {
          kind: "IngressRoute",
          plural: "ingressroutes",
          singular: "ingressroute",
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1alpha1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      routes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            services: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  port: { type: "integer" },
                                },
                              },
                            },
                          },
                        },
                      },
                      tls: {
                        type: "object",
                        properties: {
                          secretName: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "prometheuses.monitoring.coreos.com",
        uid: "crd-3",
        creationTimestamp: "2023-01-03T00:00:00Z",
        annotations: {
          cluster: "monitoring",
        },
      },
      spec: {
        group: "monitoring.coreos.com",
        names: {
          kind: "Prometheus",
          plural: "prometheuses",
          singular: "prometheus",
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      remoteWrite: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            url: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "kafkatopics.kafka.strimzi.io",
        uid: "crd-4",
        creationTimestamp: "2023-01-04T00:00:00Z",
        annotations: {
          cluster: "data",
        },
      },
      spec: {
        group: "kafka.strimzi.io",
        names: {
          kind: "KafkaTopic",
          plural: "kafkatopics",
          singular: "kafkatopic",
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1beta2",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      partitions: { type: "integer" },
                      replicas: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "deployments.apps",
        uid: "crd-5",
        creationTimestamp: "2023-01-05T00:00:00Z",
        annotations: {
          cluster: "production",
        },
      },
      spec: {
        group: "apps",
        names: {
          kind: "Deployment",
          plural: "deployments",
          singular: "deployment",
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      template: {
                        type: "object",
                        properties: {
                          spec: {
                            type: "object",
                            properties: {
                              volumes: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    configMap: {
                                      type: "object",
                                      properties: {
                                        name: { type: "string" },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "configmaps.v1",
        uid: "crd-6",
        creationTimestamp: "2023-01-06T00:00:00Z",
        annotations: {
          cluster: "production",
        },
      },
      spec: {
        group: "core",
        names: {
          kind: "ConfigMap",
          plural: "configmaps",
          singular: "configmap",
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    additionalProperties: { type: "string" },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "secrets.v1",
        uid: "crd-7",
        creationTimestamp: "2023-01-07T00:00:00Z",
        annotations: {
          cluster: "production",
        },
      },
      spec: {
        group: "core",
        names: {
          kind: "Secret",
          plural: "secrets",
          singular: "secret",
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    additionalProperties: { type: "string" },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      apiVersion: "apiextensions.k8s.io/v1",
      kind: "CustomResourceDefinition",
      metadata: {
        name: "services.v1",
        uid: "crd-8",
        creationTimestamp: "2023-01-08T00:00:00Z",
        annotations: {
          cluster: "production",
        },
      },
      spec: {
        group: "core",
        names: {
          kind: "Service",
          plural: "services",
          singular: "service",
        },
        scope: "Namespaced",
        versions: [
          {
            name: "v1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      selector: {
                        type: "object",
                        additionalProperties: { type: "string" },
                      },
                      ports: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            port: { type: "integer" },
                            targetPort: { type: "integer" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
  ]
}

// Mock data for custom resources
export const getMockCustomResources = (plural: string) => {
  const mockData: Record<string, any[]> = {
    applications: [
      {
        apiVersion: "app.k8s.io/v1beta1",
        kind: "Application",
        metadata: {
          name: "frontend-app",
          namespace: "default",
          uid: "app-1",
          creationTimestamp: "2023-02-01T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "frontend",
            "app.kubernetes.io/part-of": "web-platform",
          },
          annotations: {
            cluster: "production",
          },
          ownerReferences: [],
        },
        spec: {
          componentKinds: [
            {
              group: "core",
              kind: "Service",
            },
            {
              group: "apps",
              kind: "Deployment",
            },
          ],
          descriptor: {
            type: "frontend",
            version: "v1.0.0",
          },
          selector: {
            matchLabels: {
              "app.kubernetes.io/name": "frontend",
            },
          },
          configMapRef: {
            name: "frontend-config", // This is a valid connection to an existing ConfigMap
          },
        },
        status: {
          observedGeneration: 1,
          components: [
            {
              group: "core",
              kind: "Service",
              name: "frontend-svc",
              status: "Healthy",
            },
            {
              group: "apps",
              kind: "Deployment",
              name: "frontend-deploy",
              status: "Healthy",
            },
          ],
        },
      },
      {
        apiVersion: "app.k8s.io/v1beta1",
        kind: "Application",
        metadata: {
          name: "backend-app",
          namespace: "default",
          uid: "app-2",
          creationTimestamp: "2023-02-02T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "backend",
            "app.kubernetes.io/part-of": "web-platform",
          },
          annotations: {
            cluster: "production",
          },
          ownerReferences: [],
        },
        spec: {
          componentKinds: [
            {
              group: "core",
              kind: "Service",
            },
            {
              group: "apps",
              kind: "StatefulSet",
            },
          ],
          descriptor: {
            type: "backend",
            version: "v1.0.0",
          },
          selector: {
            matchLabels: {
              "app.kubernetes.io/name": "backend",
            },
          },
          secretRef: {
            name: "backend-secrets", // This is a valid connection to an existing Secret
          },
          serviceName: "backend-svc", // Change to a valid service that exists
        },
        status: {
          observedGeneration: 1,
          components: [
            {
              group: "core",
              kind: "Service",
              name: "backend-svc",
              status: "Healthy",
            },
            {
              group: "apps",
              kind: "StatefulSet",
              name: "backend-stateful",
              status: "Healthy",
            },
          ],
        },
      },
      {
        apiVersion: "app.k8s.io/v1beta1",
        kind: "Application",
        metadata: {
          name: "database-app",
          namespace: "database",
          uid: "app-3",
          creationTimestamp: "2023-02-03T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "database",
            "app.kubernetes.io/part-of": "data-platform",
          },
          annotations: {
            cluster: "data",
          },
          ownerReferences: [
            {
              apiVersion: "apps/v1",
              kind: "Deployment",
              name: "nonexistent-deployment",
              uid: "missing-uid-1",
            },
          ],
        },
        spec: {
          componentKinds: [
            {
              group: "core",
              kind: "Service",
            },
            {
              group: "apps",
              kind: "StatefulSet",
            },
            {
              group: "core",
              kind: "PersistentVolumeClaim",
            },
          ],
          descriptor: {
            type: "database",
            version: "v1.0.0",
          },
          selector: {
            matchLabels: {
              "app.kubernetes.io/name": "database",
            },
          },
        },
        status: {
          observedGeneration: 1,
          components: [
            {
              group: "core",
              kind: "Service",
              name: "database-svc",
              status: "Healthy",
            },
            {
              group: "apps",
              kind: "StatefulSet",
              name: "database-stateful",
              status: "Healthy",
            },
          ],
        },
      },
      {
        apiVersion: "app.k8s.io/v1beta1",
        kind: "Application",
        metadata: {
          name: "analytics-app",
          namespace: "analytics",
          uid: "app-4",
          creationTimestamp: "2023-02-04T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "analytics",
            "app.kubernetes.io/part-of": "data-platform",
          },
          annotations: {
            cluster: "monitoring",
          },
          ownerReferences: [],
        },
        spec: {
          componentKinds: [
            {
              group: "core",
              kind: "Service",
            },
            {
              group: "apps",
              kind: "Deployment",
            },
          ],
          descriptor: {
            type: "analytics",
            version: "v1.0.0",
          },
          selector: {
            matchLabels: {
              "app.kubernetes.io/name": "analytics",
            },
          },
          // Cross-cluster reference to a Kafka topic in the data cluster
          kafkaTopicRef: {
            name: "analytics-events",
            cluster: "data",
          },
        },
        status: {
          observedGeneration: 1,
          components: [
            {
              group: "core",
              kind: "Service",
              name: "analytics-svc",
              status: "Healthy",
            },
            {
              group: "apps",
              kind: "Deployment",
              name: "analytics-deploy",
              status: "Healthy",
            },
          ],
        },
      },
      {
        apiVersion: "app.k8s.io/v1beta1",
        kind: "Application",
        metadata: {
          name: "logging-app",
          namespace: "logging",
          uid: "app-5",
          creationTimestamp: "2023-02-05T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "logging",
            "app.kubernetes.io/part-of": "observability-platform",
          },
          annotations: {
            cluster: "monitoring",
          },
          ownerReferences: [
            {
              apiVersion: "apps/v1",
              kind: "Deployment",
              name: "logging-controller",
              uid: "deploy-3",
            },
          ],
        },
        spec: {
          componentKinds: [
            {
              group: "core",
              kind: "Service",
            },
            {
              group: "apps",
              kind: "Deployment",
            },
          ],
          descriptor: {
            type: "logging",
            version: "v1.0.0",
          },
          selector: {
            matchLabels: {
              "app.kubernetes.io/name": "logging",
            },
          },
          // Reference to a ConfigMap that exists
          configMapRef: {
            name: "prometheus-config",
          },
        },
        status: {
          observedGeneration: 1,
          components: [
            {
              group: "core",
              kind: "Service",
              name: "logging-svc",
              status: "Healthy",
            },
            {
              group: "apps",
              kind: "Deployment",
              name: "logging-deploy",
              status: "Healthy",
            },
          ],
        },
      },
    ],
    ingressroutes: [
      {
        apiVersion: "traefik.containo.us/v1alpha1",
        kind: "IngressRoute",
        metadata: {
          name: "frontend-route",
          namespace: "default",
          uid: "route-1",
          creationTimestamp: "2023-03-01T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "frontend",
          },
          annotations: {
            cluster: "production",
          },
        },
        spec: {
          entryPoints: ["web", "websecure"],
          routes: [
            {
              match: "Host(`example.com`) && PathPrefix(`/`)",
              kind: "Rule",
              services: [
                {
                  name: "frontend-svc", // This is a valid connection to an existing Service
                  port: 80,
                },
              ],
            },
          ],
          tls: {
            secretName: "example-tls", // This is a valid connection to an existing Secret
          },
        },
      },
      {
        apiVersion: "traefik.containo.us/v1alpha1",
        kind: "IngressRoute",
        metadata: {
          name: "backend-route",
          namespace: "default",
          uid: "route-2",
          creationTimestamp: "2023-03-02T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "backend",
          },
          annotations: {
            cluster: "production",
          },
        },
        spec: {
          entryPoints: ["websecure"],
          routes: [
            {
              match: "Host(`api.example.com`) && PathPrefix(`/`)",
              kind: "Rule",
              services: [
                {
                  name: "backend-svc",
                  port: 8080,
                },
              ],
            },
          ],
          tls: {
            secretName: "missing-tls-secret", // This will create a missing dependency
          },
        },
      },
      {
        apiVersion: "traefik.containo.us/v1alpha1",
        kind: "IngressRoute",
        metadata: {
          name: "analytics-route",
          namespace: "analytics",
          uid: "route-3",
          creationTimestamp: "2023-03-03T00:00:00Z",
          labels: {
            "app.kubernetes.io/name": "analytics",
          },
          annotations: {
            cluster: "monitoring",
          },
        },
        spec: {
          entryPoints: ["websecure"],
          routes: [
            {
              match: "Host(`analytics.example.com`) && PathPrefix(`/`)",
              kind: "Rule",
              services: [
                {
                  name: "analytics-svc",
                  port: 8080,
                },
              ],
            },
          ],
          tls: {
            secretName: "analytics-tls",
          },
        },
      },
    ],
    prometheuses: [
      {
        apiVersion: "monitoring.coreos.com/v1",
        kind: "Prometheus",
        metadata: {
          name: "cluster-monitoring",
          namespace: "monitoring",
          uid: "prom-1",
          creationTimestamp: "2023-04-01T00:00:00Z",
          annotations: {
            cluster: "monitoring",
          },
        },
        spec: {
          replicas: 2,
          version: "v2.40.0",
          serviceAccountName: "prometheus",
          securityContext: {
            fsGroup: 2000,
            runAsNonRoot: true,
            runAsUser: 1000,
          },
          serviceMonitorSelector: {
            matchLabels: {
              prometheus: "cluster-monitoring",
            },
          },
          resources: {
            requests: {
              memory: "400Mi",
            },
          },
          storage: {
            volumeClaimTemplate: {
              spec: {
                storageClassName: "standard",
                resources: {
                  requests: {
                    storage: "50Gi",
                  },
                },
              },
            },
          },
          // Cross-cluster reference to applications in production cluster
          remoteWrite: [
            {
              url: "http://prometheus-gateway.production:9090/api/v1/write",
              writeRelabelConfigs: [
                {
                  sourceLabels: ["__name__"],
                  regex: "app_.*",
                  action: "keep",
                },
              ],
            },
          ],
        },
        status: {
          availableReplicas: 2,
          paused: false,
          replicas: 2,
          updatedReplicas: 2,
        },
      },
    ],
    kafkatopics: [
      {
        apiVersion: "kafka.strimzi.io/v1beta2",
        kind: "KafkaTopic",
        metadata: {
          name: "orders",
          namespace: "kafka",
          uid: "topic-1",
          creationTimestamp: "2023-05-01T00:00:00Z",
          labels: {
            "strimzi.io/cluster": "my-cluster",
          },
          annotations: {
            cluster: "data",
          },
        },
        spec: {
          partitions: 12,
          replicas: 3,
          config: {
            "retention.ms": "604800000",
            "segment.bytes": "1073741824",
          },
        },
        status: {
          conditions: [
            {
              type: "Ready",
              status: "True",
              lastTransitionTime: "2023-05-01T00:05:00Z",
              reason: "TopicCreated",
              message: "Topic has been created",
            },
          ],
          observedGeneration: 1,
        },
      },
      {
        apiVersion: "kafka.strimzi.io/v1beta2",
        kind: "KafkaTopic",
        metadata: {
          name: "payments",
          namespace: "kafka",
          uid: "topic-2",
          creationTimestamp: "2023-05-02T00:00:00Z",
          labels: {
            "strimzi.io/cluster": "my-cluster",
          },
          annotations: {
            cluster: "data",
          },
        },
        spec: {
          partitions: 6,
          replicas: 3,
          config: {
            "retention.ms": "259200000",
            "segment.bytes": "536870912",
          },
        },
        status: {
          conditions: [
            {
              type: "Ready",
              status: "True",
              lastTransitionTime: "2023-05-02T00:05:00Z",
              reason: "TopicCreated",
              message: "Topic has been created",
            },
          ],
          observedGeneration: 1,
        },
      },
      {
        apiVersion: "kafka.strimzi.io/v1beta2",
        kind: "KafkaTopic",
        metadata: {
          name: "users",
          namespace: "kafka",
          uid: "topic-3",
          creationTimestamp: "2023-05-03T00:00:00Z",
          labels: {
            "strimzi.io/cluster": "my-cluster",
          },
          annotations: {
            cluster: "data",
          },
          ownerReferences: [
            {
              apiVersion: "kafka.strimzi.io/v1beta2",
              kind: "Kafka",
              name: "missing-kafka-cluster",
              uid: "missing-uid-2",
            },
          ],
        },
        spec: {
          partitions: 3,
          replicas: 3,
          config: {
            "retention.ms": "2592000000",
            "segment.bytes": "268435456",
          },
        },
        status: {
          conditions: [
            {
              type: "Ready",
              status: "True",
              lastTransitionTime: "2023-05-03T00:05:00Z",
              reason: "TopicCreated",
              message: "Topic has been created",
            },
          ],
          observedGeneration: 1,
        },
      },
      {
        apiVersion: "kafka.strimzi.io/v1beta2",
        kind: "KafkaTopic",
        metadata: {
          name: "analytics-events",
          namespace: "kafka",
          uid: "topic-4",
          creationTimestamp: "2023-05-04T00:00:00Z",
          labels: {
            "strimzi.io/cluster": "my-cluster",
          },
          annotations: {
            cluster: "data",
          },
        },
        spec: {
          partitions: 8,
          replicas: 3,
          config: {
            "retention.ms": "604800000",
            "segment.bytes": "536870912",
          },
        },
        status: {
          conditions: [
            {
              type: "Ready",
              status: "True",
              lastTransitionTime: "2023-05-04T00:05:00Z",
              reason: "TopicCreated",
              message: "Topic has been created",
            },
          ],
          observedGeneration: 1,
        },
      },
    ],
    deployments: [
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          name: "web-deployment",
          namespace: "default",
          uid: "deploy-1",
          creationTimestamp: "2023-06-01T00:00:00Z",
          annotations: {
            cluster: "production",
          },
        },
        spec: {
          replicas: 3,
          selector: {
            matchLabels: {
              app: "web",
            },
          },
          template: {
            metadata: {
              labels: {
                app: "web",
              },
            },
            spec: {
              containers: [
                {
                  name: "web",
                  image: "nginx:latest",
                  ports: [
                    {
                      containerPort: 80,
                    },
                  ],
                  volumeMounts: [
                    {
                      name: "config-volume",
                      mountPath: "/etc/nginx/conf.d",
                    },
                  ],
                },
              ],
              volumes: [
                {
                  name: "config-volume",
                  configMap: {
                    name: "missing-nginx-config", // This will create a missing dependency
                  },
                },
              ],
            },
          },
        },
        status: {
          availableReplicas: 3,
          readyReplicas: 3,
          replicas: 3,
          updatedReplicas: 3,
        },
      },
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          name: "analytics-deploy",
          namespace: "analytics",
          uid: "deploy-2",
          creationTimestamp: "2023-06-02T00:00:00Z",
          annotations: {
            cluster: "monitoring",
          },
        },
        spec: {
          replicas: 2,
          selector: {
            matchLabels: {
              app: "analytics",
            },
          },
          template: {
            metadata: {
              labels: {
                app: "analytics",
              },
            },
            spec: {
              containers: [
                {
                  name: "analytics",
                  image: "analytics:latest",
                  ports: [
                    {
                      containerPort: 8080,
                    },
                  ],
                  volumeMounts: [
                    {
                      name: "config-volume",
                      mountPath: "/etc/config",
                    },
                  ],
                },
              ],
              volumes: [
                {
                  name: "config-volume",
                  configMap: {
                    name: "prometheus-config", // This exists in the monitoring cluster
                  },
                },
              ],
            },
          },
        },
        status: {
          availableReplicas: 2,
          readyReplicas: 2,
          replicas: 2,
          updatedReplicas: 2,
        },
      },
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          name: "logging-controller",
          namespace: "logging",
          uid: "deploy-3",
          creationTimestamp: "2023-06-03T00:00:00Z",
          annotations: {
            cluster: "monitoring",
          },
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {
              app: "logging-controller",
            },
          },
          template: {
            metadata: {
              labels: {
                app: "logging-controller",
              },
            },
            spec: {
              containers: [
                {
                  name: "controller",
                  image: "logging-controller:latest",
                  ports: [
                    {
                      containerPort: 8080,
                    },
                  ],
                },
              ],
            },
          },
        },
        status: {
          availableReplicas: 1,
          readyReplicas: 1,
          replicas: 1,
          updatedReplicas: 1,
        },
      },
    ],
    configmaps: [
      {
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
          name: "frontend-config",
          namespace: "default",
          uid: "cm-1",
          creationTimestamp: "2023-07-01T00:00:00Z",
          annotations: {
            cluster: "production",
          },
        },
        data: {
          "app.config": "server_url=https://api.example.com\nfeature_flags=true",
          "nginx.conf": "server { listen 80; root /usr/share/nginx/html; }",
        },
      },
      {
        apiVersion: "v1",
        kind: "ConfigMap",
        metadata: {
          name: "prometheus-config",
          namespace: "monitoring",
          uid: "cm-2",
          creationTimestamp: "2023-07-02T00:00:00Z",
          annotations: {
            cluster: "monitoring",
          },
        },
        data: {
          "prometheus.yml": "global:\n  scrape_interval: 15s\n  evaluation_interval: 15s",
        },
      },
    ],
    secrets: [
      {
        apiVersion: "v1",
        kind: "Secret",
        metadata: {
          name: "backend-secrets",
          namespace: "default",
          uid: "secret-1",
          creationTimestamp: "2023-08-01T00:00:00Z",
          annotations: {
            cluster: "production",
          },
        },
        type: "Opaque",
        data: {
          "api-key": "c2VjcmV0LWtleQ==", // base64 encoded "secret-key"
          "db-password": "cGFzc3dvcmQxMjM=", // base64 encoded "password123"
        },
      },
      {
        apiVersion: "v1",
        kind: "Secret",
        metadata: {
          name: "analytics-tls",
          namespace: "analytics",
          uid: "secret-2",
          creationTimestamp: "2023-08-02T00:00:00Z",
          annotations: {
            cluster: "monitoring",
          },
        },
        type: "kubernetes.io/tls",
        data: {
          "tls.crt": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t",
          "tls.key": "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t",
        },
      },
      {
        apiVersion: "v1",
        kind: "Secret",
        metadata: {
          name: "example-tls",
          namespace: "default",
          uid: "secret-3",
          creationTimestamp: "2023-08-03T00:00:00Z",
          annotations: {
            cluster: "production",
          },
        },
        type: "kubernetes.io/tls",
        data: {
          "tls.crt": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t",
          "tls.key": "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t",
        },
      },
    ],
    services: [
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
          name: "frontend-svc",
          namespace: "default",
          uid: "svc-1",
          creationTimestamp: "2023-09-01T00:00:00Z",
          annotations: {
            cluster: "production",
          },
        },
        spec: {
          selector: {
            app: "web",
          },
          ports: [
            {
              port: 80,
              targetPort: 80,
            },
          ],
        },
      },
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
          name: "backend-svc",
          namespace: "default",
          uid: "svc-2",
          creationTimestamp: "2023-09-02T00:00:00Z",
          annotations: {
            cluster: "production",
          },
        },
        spec: {
          selector: {
            app: "backend",
          },
          ports: [
            {
              port: 8080,
              targetPort: 8080,
            },
          ],
        },
      },
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
          name: "analytics-svc",
          namespace: "analytics",
          uid: "svc-3",
          creationTimestamp: "2023-09-03T00:00:00Z",
          annotations: {
            cluster: "monitoring",
          },
        },
        spec: {
          selector: {
            app: "analytics",
          },
          ports: [
            {
              port: 8080,
              targetPort: 8080,
            },
          ],
        },
      },
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
          name: "prometheus-gateway",
          namespace: "prometheus",
          uid: "svc-4",
          creationTimestamp: "2023-09-04T00:00:00Z",
          annotations: {
            cluster: "production",
          },
        },
        spec: {
          selector: {
            app: "prometheus-gateway",
          },
          ports: [
            {
              port: 9090,
              targetPort: 9090,
            },
          ],
        },
      },
    ],
  }

  return mockData[plural] || []
}

