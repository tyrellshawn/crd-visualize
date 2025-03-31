"use client"

import { useState, memo, useEffect } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { ChevronDown, ChevronRight, Download, Maximize, Minimize, LayoutGrid } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { downloadYaml } from "@/lib/download-utils"

// Update the ResourceNodeData interface to include cluster information
interface ResourceNodeData {
  label: string
  kind: string
  namespace?: string
  apiVersion: string
  data: any
  resourceType: "crd" | "resource" | "reference"
  isSearchResult?: boolean
  cluster?: string
  hasCrossClusterDependencies?: boolean
  crossClusterDependencies?: string[]
}

// Define view modes
type ViewMode = "minimal" | "partial" | "full"

function ResourceNode({ data }: NodeProps<ResourceNodeData>) {
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("minimal")
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Determine node color based on kind/resourceType, search result status
  // Update the getNodeColor function to include cluster-specific colors
  const getNodeColor = () => {
    // Base colors for different resource types
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      crd: {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-300 dark:border-blue-700",
        text: "text-blue-700 dark:text-blue-300",
      },
      resource: {
        bg: "bg-purple-50 dark:bg-purple-950",
        border: "border-purple-300 dark:border-purple-700",
        text: "text-purple-700 dark:text-purple-300",
      },
      reference: {
        bg: "bg-amber-50 dark:bg-amber-950",
        border: "border-amber-300 dark:border-amber-700",
        text: "text-amber-700 dark:text-amber-300",
      },
    }

    // Cluster-specific colors
    const clusterColors: Record<string, { bg: string; border: string; text: string }> = {
      production: {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-300 dark:border-blue-700",
        text: "text-blue-700 dark:text-blue-300",
      },
      monitoring: {
        bg: "bg-purple-50 dark:bg-purple-950",
        border: "border-purple-300 dark:border-purple-700",
        text: "text-purple-700 dark:text-purple-300",
      },
      data: {
        bg: "bg-green-50 dark:bg-green-950",
        border: "border-green-300 dark:border-green-700",
        text: "text-green-700 dark:text-green-300",
      },
    }

    // Use cluster color if available, otherwise use resource type color
    const result =
      data.cluster && clusterColors[data.cluster]
        ? clusterColors[data.cluster]
        : colors[data.resourceType] || {
            bg: "bg-slate-50 dark:bg-slate-900",
            border: "border-slate-300 dark:border-slate-700",
            text: "text-slate-700 dark:text-slate-300",
          }

    // If this resource has cross-cluster dependencies, use a dashed orange border
    if (data.hasCrossClusterDependencies) {
      result.border = "border-orange-500 dark:border-orange-400 border-dashed"
    }

    // If this is a search result, use a green border
    if (data.isSearchResult) {
      result.border = "border-green-500 dark:border-green-400"
    }

    return result
  }

  const { bg, border, text } = getNodeColor()

  // Update expanded sections when view mode changes
  useEffect(() => {
    if (!data.data) return

    let newExpandedSections: string[] = []

    if (viewMode === "full") {
      // Expand all sections in full mode
      newExpandedSections = getAllPaths(data.data)
    } else if (viewMode === "partial") {
      // Expand important sections in partial mode
      newExpandedSections = getImportantSections(data.data)
    }

    // Only update if the sections have actually changed
    // Use JSON.stringify for deep comparison
    const currentSectionsStr = JSON.stringify(expandedSections.sort())
    const newSectionsStr = JSON.stringify(newExpandedSections.sort())

    if (currentSectionsStr !== newSectionsStr) {
      setExpandedSections(newExpandedSections)
    }
  }, [viewMode, data.data])

  // Get all possible paths for accordion items
  const getAllPaths = (obj: any, path = ""): string[] => {
    if (!obj || typeof obj !== "object") return []

    let paths: string[] = []

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      paths.push(currentPath)

      if (value && typeof value === "object") {
        paths = [...paths, ...getAllPaths(value, currentPath)]
      }
    })

    return paths
  }

  // Get important sections for partial mode
  const getImportantSections = (obj: any): string[] => {
    const importantKeys = [
      "metadata",
      "metadata.name",
      "metadata.namespace",
      "metadata.labels",
      "metadata.annotations",
      "spec",
      "status",
      "rules",
      "subjects",
      "roleRef",
      "data",
      "stringData",
      "ports",
      "containers",
      "volumes",
      "template",
    ]

    // Start with the top-level important keys
    return importantKeys.filter((key) => {
      const parts = key.split(".")
      let current = obj

      for (const part of parts) {
        if (!current || typeof current !== "object" || !(part in current)) {
          return false
        }
        current = current[part]
      }

      return true
    })
  }

  // Get fields to display based on view mode
  const getFieldsToDisplay = (obj: any): string[] => {
    if (viewMode === "minimal") {
      // Show only essential fields in minimal mode
      return ["name", "namespace", "kind", "apiVersion"]
    } else if (viewMode === "partial") {
      // Show important fields in partial mode
      return ["metadata", "spec", "status"]
    } else {
      // Show all fields in full mode
      return Object.keys(obj)
    }
  }

  // Handle download
  const handleDownload = () => {
    if (data.data) {
      const filename = `${data.kind.toLowerCase()}-${data.label}.yaml`
      downloadYaml(data.data, filename)
    }
  }

  // Render complex object with expandable sections
  const renderComplexValue = (obj: any, path = "") => {
    if (!obj || typeof obj !== "object") return null

    const fieldsToDisplay = viewMode === "minimal" ? getFieldsToDisplay(obj) : Object.keys(obj)

    return (
      <Accordion type="multiple" className="w-full" value={expandedSections} onValueChange={setExpandedSections}>
        {Object.entries(obj)
          .filter(([key]) => fieldsToDisplay.includes(key))
          .map(([key, value]) => {
            const currentPath = path ? `${path}.${key}` : key
            const isObject = value && typeof value === "object" && !Array.isArray(value)
            const isArray = Array.isArray(value)

            if (isObject && Object.keys(value as object).length === 0) {
              return (
                <div key={currentPath} className="pl-4 py-1 text-sm">
                  <span className="font-medium">{key}:</span> {"{}"}
                </div>
              )
            }

            if (isArray && (value as any[]).length === 0) {
              return (
                <div key={currentPath} className="pl-4 py-1 text-sm">
                  <span className="font-medium">{key}:</span> []
                </div>
              )
            }

            if (isObject || isArray) {
              return (
                <AccordionItem key={currentPath} value={currentPath} className="border-b-0">
                  <AccordionTrigger className="py-1 text-sm hover:no-underline">
                    <span className="font-medium">{key}</span>
                    {isArray && <span className="text-xs text-muted-foreground ml-1">({(value as any[]).length})</span>}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    {isArray ? (
                      <div className="pl-4">
                        {(value as any[]).map((item, index) => (
                          <div key={`${currentPath}-${index}`} className="border-l border-muted pl-2 mb-2">
                            {typeof item === "object" ? (
                              renderComplexValue(item, `${currentPath}[${index}]`)
                            ) : (
                              <div className="text-sm py-1">{String(item)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      renderComplexValue(value, currentPath)
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            }

            return (
              <div key={currentPath} className="pl-4 py-1 text-sm">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            )
          })}
      </Accordion>
    )
  }

  // Render minimal view (just a few key fields)
  const renderMinimalView = () => {
    const { metadata = {}, kind, apiVersion } = data.data || {}

    return (
      <div className="text-sm space-y-1 p-1">
        {metadata.name && (
          <div>
            <span className="font-medium">Name:</span> {metadata.name}
          </div>
        )}
        {metadata.namespace && (
          <div>
            <span className="font-medium">Namespace:</span> {metadata.namespace}
          </div>
        )}
        {kind && (
          <div>
            <span className="font-medium">Kind:</span> {kind}
          </div>
        )}
        {apiVersion && (
          <div>
            <span className="font-medium">API Version:</span> {apiVersion}
          </div>
        )}
        {/* Add cross-cluster dependencies to the minimal view */}
        {data.hasCrossClusterDependencies &&
          data.crossClusterDependencies &&
          data.crossClusterDependencies.length > 0 && (
            <div className="mt-2 text-orange-500 dark:text-orange-400">
              <div className="font-medium">Cross-Cluster Dependencies:</div>
              <ul className="list-disc pl-4">
                {data.crossClusterDependencies.map((dep, index) => (
                  <li key={index}>{dep}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
    )
  }

  return (
    <>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />

      <Card
        className={`min-w-[250px] max-w-[400px] shadow-md ${bg} ${border} border-2 ${
          data.isSearchResult ? "ring-2 ring-green-500 dark:ring-green-400" : ""
        }`}
      >
        <CardHeader className={`p-3 pb-2 ${text}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 rounded-sm hover:bg-black/5 dark:hover:bg-white/5"
              >
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {data.label}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className={`text-xs ${text}`}>
                {data.kind}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download YAML</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {/* Add cluster badge to the CardHeader */}
          <div className="flex flex-wrap gap-1 mt-1 text-xs">
            {data.namespace && (
              <Badge variant="secondary" className="text-xs">
                {data.namespace}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {data.apiVersion}
            </Badge>
            {data.cluster && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  data.cluster === "production"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : data.cluster === "monitoring"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      : data.cluster === "data"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : ""
                }`}
              >
                {data.cluster}
              </Badge>
            )}
          </div>
        </CardHeader>

        {expanded && (
          <>
            <CardContent className="p-3 pt-2">
              <ScrollArea
                className={
                  viewMode === "full" ? "max-h-[600px]" : viewMode === "partial" ? "max-h-[400px]" : "max-h-[150px]"
                }
              >
                {viewMode === "minimal" && renderMinimalView()}
                {viewMode !== "minimal" && renderComplexValue(data.data)}
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-2 flex justify-between border-t">
              <TooltipProvider>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "minimal" ? "default" : "outline"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode("minimal")}
                      >
                        <Minimize className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Minimal View</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "partial" ? "default" : "outline"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode("partial")}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Partial View</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "full" ? "default" : "outline"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode("full")}
                      >
                        <Maximize className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Full View</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </CardFooter>
          </>
        )}
      </Card>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </>
  )
}

export default memo(ResourceNode)

