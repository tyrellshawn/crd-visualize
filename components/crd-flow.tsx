"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type NodeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import { Loader2, ZoomIn, ZoomOut, Maximize2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import ResourceNode from "@/components/resource-node"
import { generateNodesAndEdges } from "@/lib/graph-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SearchPanel from "@/components/search-panel"

// Define custom node types
const nodeTypes: NodeTypes = {
  resourceNode: ResourceNode,
}

// Update the Flow component props to include customMappings
function Flow({
  crds,
  customResources,
  selectedCrd,
  customMappings = [],
}: {
  crds: any[]
  customResources: any[]
  selectedCrd: string | null
  customMappings?: any[]
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"minimal" | "partial" | "full">("minimal")
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { fitView, zoomIn, zoomOut, getNodes, setCenter } = useReactFlow()

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  // Update the useEffect that generates nodes and edges to use custom mappings
  useEffect(() => {
    if (!customResources.length) return

    setLoading(true)

    // Use setTimeout to prevent UI freeze for large datasets
    setTimeout(() => {
      const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(
        crds,
        customResources,
        selectedCrd,
        customMappings,
      )
      setNodes(newNodes)
      setEdges(newEdges)
      setLoading(false)

      // Fit view after nodes are rendered
      setTimeout(() => {
        fitView({ padding: 0.2 })
      }, 100)
    }, 0)
  }, [crds, customResources, selectedCrd, customMappings, setNodes, setEdges, fitView])

  // Handle search results - memoized to prevent infinite loops
  const handleSearchResults = useCallback(
    (results: string[]) => {
      // Only update if the results have actually changed
      if (JSON.stringify(results) !== JSON.stringify(searchResults)) {
        setSearchResults(results)

        // Focus on the first result if there are any
        if (results.length > 0) {
          const resultNode = getNodes().find((node) => results.includes(node.id))
          if (resultNode) {
            setCenter(resultNode.position.x, resultNode.position.y, { zoom: 1.5, duration: 800 })
          }
        }

        // Update nodes to highlight search results without triggering a loop
        setNodes((currentNodes) => {
          // Check if we actually need to update
          const needsUpdate = currentNodes.some(
            (node) =>
              (results.includes(node.id) && !node.data.isSearchResult) ||
              (!results.includes(node.id) && node.data.isSearchResult),
          )

          if (!needsUpdate) return currentNodes

          return currentNodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              isSearchResult: results.includes(node.id),
            },
          }))
        })
      }
    },
    [getNodes, setCenter, setNodes, searchResults],
  )

  // Reset search results when closing search panel
  const handleCloseSearch = useCallback(() => {
    setShowSearch(false)
    setSearchResults([])
  }, [])

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background variant="dots" gap={12} size={1} />

        {/* Search Panel */}
        {showSearch && (
          <Panel position="top-left" className="w-80">
            <SearchPanel
              nodes={nodes}
              edges={edges}
              onSearchResults={handleSearchResults}
              onClose={handleCloseSearch}
            />
          </Panel>
        )}

        {/* Controls Panel */}
        <Panel position="top-right" className="flex flex-col gap-2">
          <TooltipProvider>
            <div className="flex flex-col gap-2 bg-background/80 p-2 rounded-md shadow-sm">
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoomIn()}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom In</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => zoomOut()}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom Out</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => fitView({ padding: 0.2 })}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fit View</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showSearch ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowSearch(!showSearch)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="view-mode" className="text-xs">
                  Default View
                </Label>
                <Select value={viewMode} onValueChange={(value: "minimal" | "partial" | "full") => setViewMode(value)}>
                  <SelectTrigger id="view-mode" className="h-8">
                    <SelectValue placeholder="View Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add legend beneath the Default View */}
              <div className="mt-3 pt-3 border-t">
                <div className="text-sm font-medium mb-2">Legend</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-500 rounded-sm"></div>
                    <span className="text-xs">Search Result</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-dashed rounded-sm"></div>
                    <span className="text-xs">Cross-Cluster Reference</span>
                  </div>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </Panel>
      </ReactFlow>
    </div>
  )
}

// Update the CrdFlow component props to include customMappings
export default function CrdFlow({
  crds,
  customResources,
  selectedCrd,
  customMappings = [],
}: {
  crds: any[]
  customResources: any[]
  selectedCrd: string | null
  customMappings?: any[]
}) {
  return (
    <ReactFlowProvider>
      <Flow crds={crds} customResources={customResources} selectedCrd={selectedCrd} customMappings={customMappings} />
    </ReactFlowProvider>
  )
}

