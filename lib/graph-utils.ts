"use client"

import type { Node, Edge } from "reactflow"

// Generate nodes and edges from CRDs and custom resources
export const generateNodesAndEdges = (
  crds: any[],
  customResources: any[],
  selectedCrd: string | null,
  customMappings: any[] = [],
) => {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const nodeMap = new Map<string, string>() // Map resource UIDs to node IDs
  const resourceMap = new Map<string, any>() // Map resource names to resource objects
  const clusterColors: Record<string, string> = {
    production: "#3b82f6", // blue
    monitoring: "#8b5cf6", // purple
    data: "#10b981", // green
    default: "#94a3b8", // slate
  }

  // First pass: create a map of all resources for dependency checking
  customResources.forEach((resource) => {
    const cluster = resource.metadata.annotations?.cluster || "default"
    const resourceKey = `${resource.kind}:${resource.metadata.namespace || "cluster"}:${resource.metadata.name}:${cluster}`
    resourceMap.set(resourceKey, resource)
  })

  // Add custom resources as nodes
  customResources.forEach((resource, index) => {
    const nodeId = `resource-${resource.metadata.uid || index}`
    const cluster = resource.metadata.annotations?.cluster || "default"
    nodeMap.set(resource.metadata.uid, nodeId)

    // Track dependencies for this resource
    const crossClusterDeps = new Set<string>()

    nodes.push({
      id: nodeId,
      type: "resourceNode",
      position: { x: 250, y: index * 200 }, // Initial positions will be adjusted by layout
      data: {
        label: resource.metadata.name,
        kind: resource.kind,
        namespace: resource.metadata.namespace,
        apiVersion: resource.apiVersion,
        data: resource,
        resourceType: "resource",
        cluster: cluster,
        hasCrossClusterDependencies: false,
        crossClusterDependencies: [],
      },
    })

    // Find the CRD for this resource
    const crd = crds.find(
      (c) => c.spec.names.kind === resource.kind && c.spec.group === resource.apiVersion.split("/")[0],
    )

    if (crd) {
      const crdNodeId = `crd-${crd.metadata.uid || crd.metadata.name}`
      const crdCluster = crd.metadata.annotations?.cluster || "default"

      // Add CRD node if it doesn't exist yet
      if (!nodes.some((n) => n.id === crdNodeId)) {
        nodes.push({
          id: crdNodeId,
          type: "resourceNode",
          position: { x: 0, y: nodes.length * 200 },
          data: {
            label: crd.spec.names.kind,
            kind: "CRD",
            apiVersion: `${crd.spec.group}/${crd.spec.versions[0].name}`,
            data: crd,
            resourceType: "crd",
            cluster: crdCluster,
            hasCrossClusterDependencies: false,
            crossClusterDependencies: [],
          },
        })
      }

      // Add edge from CRD to resource
      edges.push({
        id: `edge-crd-${crd.metadata.uid}-${resource.metadata.uid}`,
        source: crdNodeId,
        target: nodeId,
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 2, strokeDasharray: "5 5" },
      })
    }

    // Process relationships

    // 1. Owner references
    if (resource.metadata.ownerReferences) {
      resource.metadata.ownerReferences.forEach((ref: any) => {
        const ownerCluster = resource.metadata.annotations?.cluster || "default"
        const ownerKey = `${ref.kind}:${resource.metadata.namespace || "cluster"}:${ref.name}:${ownerCluster}`
        const ownerId = `reference-${ref.uid}`

        // Add owner node if it doesn't exist in our resources
        if (!nodeMap.has(ref.uid)) {
          nodes.push({
            id: ownerId,
            type: "resourceNode",
            position: { x: 500, y: nodes.length * 200 },
            data: {
              label: ref.name,
              kind: ref.kind,
              apiVersion: ref.apiVersion,
              data: { metadata: { name: ref.name, uid: ref.uid }, kind: ref.kind, apiVersion: ref.apiVersion },
              resourceType: "reference",
              cluster: ownerCluster,
              hasCrossClusterDependencies: false,
              crossClusterDependencies: [],
            },
          })
          nodeMap.set(ref.uid, ownerId)
        }

        // Add edge from resource to owner
        edges.push({
          id: `edge-${resource.metadata.uid}-${ref.uid}`,
          source: nodeId,
          target: nodeMap.get(ref.uid) || ownerId,
          animated: true,
          label: "ownedBy",
          labelStyle: { fill: "#94a3b8", fontWeight: 700 },
          style: { stroke: "#f43f5e", strokeWidth: 2 },
        })
      })
    }

    // 2. Look for specific fields that might reference other resources
    if (resource.spec) {
      // Example for ConfigMap references
      if (resource.spec.configMapRef) {
        const configMapCluster = resource.metadata.annotations?.cluster || "default"
        const configMapKey = `ConfigMap:${resource.metadata.namespace || "default"}:${resource.spec.configMapRef.name}:${configMapCluster}`
        const targetId = `configmap-${resource.spec.configMapRef.name}`

        if (!nodes.some((n) => n.id === targetId)) {
          nodes.push({
            id: targetId,
            type: "resourceNode",
            position: { x: 500, y: nodes.length * 200 },
            data: {
              label: resource.spec.configMapRef.name,
              kind: "ConfigMap",
              namespace: resource.metadata.namespace,
              apiVersion: "v1",
              data: { metadata: { name: resource.spec.configMapRef.name } },
              resourceType: "reference",
              cluster: configMapCluster,
              hasCrossClusterDependencies: false,
              crossClusterDependencies: [],
            },
          })
        }

        edges.push({
          id: `edge-${resource.metadata.uid}-configmap-${resource.spec.configMapRef.name}`,
          source: nodeId,
          target: targetId,
          animated: false,
          label: "references",
          labelStyle: { fill: "#94a3b8", fontWeight: 700 },
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        })
      }

      // Example for Secret references
      if (resource.spec.secretRef) {
        const secretCluster = resource.metadata.annotations?.cluster || "default"
        const secretKey = `Secret:${resource.metadata.namespace || "default"}:${resource.spec.secretRef.name}:${secretCluster}`
        const targetId = `secret-${resource.spec.secretRef.name}`

        if (!nodes.some((n) => n.id === targetId)) {
          nodes.push({
            id: targetId,
            type: "resourceNode",
            position: { x: 500, y: nodes.length * 200 },
            data: {
              label: resource.spec.secretRef.name,
              kind: "Secret",
              namespace: resource.metadata.namespace,
              apiVersion: "v1",
              data: { metadata: { name: resource.spec.secretRef.name } },
              resourceType: "reference",
              cluster: secretCluster,
              hasCrossClusterDependencies: false,
              crossClusterDependencies: [],
            },
          })
        }

        edges.push({
          id: `edge-${resource.metadata.uid}-secret-${resource.spec.secretRef.name}`,
          source: nodeId,
          target: targetId,
          animated: false,
          label: "references",
          labelStyle: { fill: "#94a3b8", fontWeight: 700 },
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        })
      }

      // Check for service references
      if (resource.spec.serviceName) {
        const serviceCluster = resource.metadata.annotations?.cluster || "default"
        const serviceKey = `Service:${resource.metadata.namespace || "default"}:${resource.spec.serviceName}:${serviceCluster}`
        const targetId = `service-${resource.spec.serviceName}`

        if (!nodes.some((n) => n.id === targetId)) {
          nodes.push({
            id: targetId,
            type: "resourceNode",
            position: { x: 500, y: nodes.length * 200 },
            data: {
              label: resource.spec.serviceName,
              kind: "Service",
              namespace: resource.metadata.namespace,
              apiVersion: "v1",
              data: { metadata: { name: resource.spec.serviceName } },
              resourceType: "reference",
              cluster: serviceCluster,
              hasCrossClusterDependencies: false,
              crossClusterDependencies: [],
            },
          })
        }

        edges.push({
          id: `edge-${resource.metadata.uid}-service-${resource.spec.serviceName}`,
          source: nodeId,
          target: targetId,
          animated: false,
          label: "references",
          labelStyle: { fill: "#94a3b8", fontWeight: 700 },
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        })
      }

      // Check for Kafka topic references (cross-cluster)
      if (resource.spec.kafkaTopicRef) {
        const topicName = resource.spec.kafkaTopicRef.name
        const topicCluster = resource.spec.kafkaTopicRef.cluster || resource.metadata.annotations?.cluster || "default"
        const topicKey = `KafkaTopic:kafka:${topicName}:${topicCluster}`
        const targetId = `kafka-topic-${topicName}`

        // If the topic is in a different cluster, mark as cross-cluster dependency
        if (topicCluster !== cluster) {
          crossClusterDeps.add(topicKey)
        }

        if (!nodes.some((n) => n.id === targetId)) {
          nodes.push({
            id: targetId,
            type: "resourceNode",
            position: { x: 500, y: nodes.length * 200 },
            data: {
              label: topicName,
              kind: "KafkaTopic",
              namespace: "kafka",
              apiVersion: "kafka.strimzi.io/v1beta2",
              data: { metadata: { name: topicName } },
              resourceType: "reference",
              cluster: topicCluster,
              hasCrossClusterDependencies: false,
              crossClusterDependencies: [],
            },
          })
        }

        // Add edge with special styling for cross-cluster references
        edges.push({
          id: `edge-${resource.metadata.uid}-kafka-${topicName}`,
          source: nodeId,
          target: targetId,
          animated: true,
          label: "references",
          labelStyle: { fill: "#94a3b8", fontWeight: 700 },
          style: {
            stroke: topicCluster !== cluster ? "#f97316" : "#3b82f6", // Orange for cross-cluster
            strokeWidth: 2,
            strokeDasharray: topicCluster !== cluster ? "5 5" : undefined,
          },
        })
      }

      // Check for Prometheus remoteWrite (cross-cluster)
      if (resource.spec.remoteWrite) {
        resource.spec.remoteWrite.forEach((rw: any, rwIndex: number) => {
          if (rw.url && rw.url.includes(".production:")) {
            const targetCluster = "production"
            const targetId = `prometheus-gateway-${rwIndex}`
            const targetKey = `Service:prometheus:prometheus-gateway:${targetCluster}`

            // Mark as cross-cluster dependency
            if (targetCluster !== cluster) {
              crossClusterDeps.add(targetKey)
            }

            if (!nodes.some((n) => n.id === targetId)) {
              nodes.push({
                id: targetId,
                type: "resourceNode",
                position: { x: 500, y: nodes.length * 200 },
                data: {
                  label: "prometheus-gateway",
                  kind: "Service",
                  namespace: "prometheus",
                  apiVersion: "v1",
                  data: { metadata: { name: "prometheus-gateway" } },
                  resourceType: "reference",
                  cluster: targetCluster,
                  hasCrossClusterDependencies: false,
                  crossClusterDependencies: [],
                },
              })
            }

            // Add edge with special styling for cross-cluster references
            edges.push({
              id: `edge-${resource.metadata.uid}-prometheus-gateway-${rwIndex}`,
              source: nodeId,
              target: targetId,
              animated: true,
              label: "remoteWrite",
              labelStyle: { fill: "#94a3b8", fontWeight: 700 },
              style: {
                stroke: "#f97316", // Orange for cross-cluster
                strokeWidth: 2,
                strokeDasharray: "5 5",
              },
            })
          }
        })
      }
    }

    // Process custom mappings
    if (customMappings.length > 0) {
      customMappings.forEach((mapping) => {
        // Check if this resource matches the source kind and API version
        if (resource.kind === mapping.sourceKind && resource.apiVersion.includes(mapping.sourceApiVersion)) {
          // Get the source field value using the path
          const sourceFieldValue = getValueByPath(resource, mapping.sourceField)

          if (sourceFieldValue) {
            // Look for target resources that match this mapping
            customResources.forEach((targetResource) => {
              if (
                targetResource.kind === mapping.targetKind &&
                targetResource.apiVersion.includes(mapping.targetApiVersion)
              ) {
                // Get the target field value
                const targetFieldValue = getValueByPath(targetResource, mapping.targetField)

                // If the values match, create a relationship
                if (targetFieldValue && sourceFieldValue === targetFieldValue) {
                  const targetNodeId = `resource-${targetResource.metadata.uid}`
                  const targetCluster = targetResource.metadata.annotations?.cluster || "default"

                  // Check if this is a cross-cluster dependency
                  if (targetCluster !== cluster) {
                    crossClusterDeps.add(
                      `${mapping.targetKind}:${targetResource.metadata.namespace || "cluster"}:${targetResource.metadata.name}:${targetCluster}`,
                    )
                  }

                  // Add edge for this custom relationship
                  edges.push({
                    id: `edge-custom-${resource.metadata.uid}-${targetResource.metadata.uid}`,
                    source: nodeId,
                    target: targetNodeId,
                    animated: true,
                    label: mapping.name,
                    labelStyle: { fill: "#94a3b8", fontWeight: 700 },
                    style: {
                      stroke: targetCluster !== cluster ? "#f97316" : "#6366f1", // Orange for cross-cluster, indigo for same cluster
                      strokeWidth: 2,
                      strokeDasharray: targetCluster !== cluster ? "5 5" : undefined,
                    },
                  })
                }
              }
            })
          }
        }
      })
    }

    // If this resource has cross-cluster dependencies, mark it
    if (crossClusterDeps.size > 0) {
      // Update the node data with cross-cluster dependencies info
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId)
      if (nodeIndex !== -1) {
        nodes[nodeIndex].data.hasCrossClusterDependencies = true
        nodes[nodeIndex].data.crossClusterDependencies = Array.from(crossClusterDeps)
      }
    }
  })

  // Apply a simple force-directed layout algorithm
  // In a real app, you might want to use a more sophisticated layout
  const layoutNodes = applySimpleLayout(nodes, edges)

  return { nodes: layoutNodes, edges }
}

// Add a helper function to get a value by path
const getValueByPath = (obj: any, path: string): any => {
  if (!obj || !path) return undefined

  const parts = path.split(".")
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }

    // Handle array notation like items[0]
    if (part.includes("[") && part.includes("]")) {
      const arrayPart = part.split("[")[0]
      const indexPart = part.split("[")[1].split("]")[0]
      const index = Number.parseInt(indexPart)

      if (current[arrayPart] && Array.isArray(current[arrayPart]) && current[arrayPart].length > index) {
        current = current[arrayPart][index]
      } else {
        return undefined
      }
    } else {
      current = current[part]
    }
  }

  return current
}

// Simple layout algorithm to prevent node overlap
const applySimpleLayout = (nodes: Node[], edges: Edge[]) => {
  // Group nodes by type and cluster
  const crdNodes = nodes.filter((n) => (n.data as any).resourceType === "crd")
  const resourceNodes = nodes.filter((n) => (n.data as any).resourceType === "resource")
  const referenceNodes = nodes.filter((n) => (n.data as any).resourceType === "reference")

  // Position CRDs on the left
  crdNodes.forEach((node, i) => {
    node.position = { x: 50, y: i * 400 }
  })

  // Position resources in the middle
  resourceNodes.forEach((node, i) => {
    node.position = { x: 450, y: i * 200 }
  })

  // Position references on the right
  referenceNodes.forEach((node, i) => {
    node.position = { x: 850, y: i * 200 }
  })

  return [...crdNodes, ...resourceNodes, ...referenceNodes]
}

