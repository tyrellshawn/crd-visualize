"use client"

// Get value from an object by dot-notation path
export const getValueByPath = (obj: any, path: string): any => {
  if (!obj || !path) return undefined

  const parts = path.split(".")
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }

    current = current[part]
  }

  return current
}

// Find all nodes connected to a given node
export const findConnectedNodes = (
  nodeId: string,
  edges: any[],
  direction: "both" | "incoming" | "outgoing" = "both",
): string[] => {
  const connectedIds = new Set<string>()

  edges.forEach((edge) => {
    if (direction === "both" || direction === "outgoing") {
      if (edge.source === nodeId) {
        connectedIds.add(edge.target)
      }
    }

    if (direction === "both" || direction === "incoming") {
      if (edge.target === nodeId) {
        connectedIds.add(edge.source)
      }
    }
  })

  return Array.from(connectedIds)
}

// Find all nodes in a dependency chain (recursive)
export const findDependencyChain = (
  startNodeId: string,
  edges: any[],
  allNodes: any[],
  direction: "both" | "incoming" | "outgoing" = "both",
  visited = new Set<string>(),
): any[] => {
  // Prevent infinite loops
  if (visited.has(startNodeId)) {
    return []
  }

  visited.add(startNodeId)

  // Find directly connected nodes
  const connectedIds = findConnectedNodes(startNodeId, edges, direction)
  const connectedNodes = allNodes.filter((node) => connectedIds.includes(node.id))

  // Recursively find dependencies of dependencies
  const nestedDependencies = connectedNodes.flatMap((node) =>
    findDependencyChain(node.id, edges, allNodes, direction, visited),
  )

  // Combine direct dependencies with nested ones
  return [...connectedNodes, ...nestedDependencies]
}

