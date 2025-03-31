"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, ChevronDown, Trash2, Copy } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { toast } from "sonner"
import yaml from "js-yaml"

export default function CrdBrowser() {
  const { crds, customResources, deleteCrd, deleteCustomResource } = useDataStore()
  const [expandedCrds, setExpandedCrds] = useState<Record<string, boolean>>({})
  const [selectedCrd, setSelectedCrd] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [resourceYaml, setResourceYaml] = useState<string>("")

  // Group resources by their kind
  const resourcesByKind = customResources.reduce(
    (acc, resource) => {
      const kind = resource.kind
      if (!acc[kind]) {
        acc[kind] = []
      }
      acc[kind].push(resource)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // Toggle expanded state for a CRD
  const toggleCrdExpanded = (crdKind: string) => {
    setExpandedCrds((prev) => ({
      ...prev,
      [crdKind]: !prev[crdKind],
    }))
  }

  // Handle selecting a CRD
  const handleSelectCrd = (crd: any) => {
    setSelectedCrd(crd.metadata.uid)
    setSelectedResource(null)
    setResourceYaml(yaml.dump(crd))
  }

  // Handle selecting a resource
  const handleSelectResource = (resource: any) => {
    setSelectedResource(resource.metadata.uid)
    setSelectedCrd(null)
    setResourceYaml(yaml.dump(resource))
  }

  // Handle copying YAML to clipboard
  const handleCopyYaml = () => {
    navigator.clipboard.writeText(resourceYaml)
    toast.success("Copied to clipboard", {
      description: "YAML has been copied to your clipboard",
    })
  }

  // Handle deleting a CRD
  const handleDeleteCrd = (crdUid: string) => {
    deleteCrd(crdUid)
    if (selectedCrd === crdUid) {
      setSelectedCrd(null)
      setResourceYaml("")
    }
    toast.success("CRD Deleted", {
      description: "The CRD has been deleted",
    })
  }

  // Handle deleting a resource
  const handleDeleteResource = (resourceUid: string) => {
    deleteCustomResource(resourceUid)
    if (selectedResource === resourceUid) {
      setSelectedResource(null)
      setResourceYaml("")
    }
    toast.success("Resource Deleted", {
      description: "The resource has been deleted",
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left panel: CRD and Resource Browser */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Resource Definitions</CardTitle>
          <CardDescription>Browse CRDs and their resources</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {crds.map((crd) => (
                <Collapsible
                  key={crd.metadata.uid}
                  open={expandedCrds[crd.spec.names.kind]}
                  onOpenChange={() => toggleCrdExpanded(crd.spec.names.kind)}
                  className="border rounded-md"
                >
                  <div
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSelectCrd(crd)}
                  >
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          {expandedCrds[crd.spec.names.kind] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <span className="font-medium">{crd.spec.names.kind}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {crd.spec.group}/{crd.spec.versions[0].name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCrd(crd.metadata.uid)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="pl-8 pr-2 pb-2 space-y-1">
                      {resourcesByKind[crd.spec.names.kind]?.length > 0 ? (
                        resourcesByKind[crd.spec.names.kind].map((resource) => (
                          <div
                            key={resource.metadata.uid}
                            className={`p-2 rounded-md cursor-pointer hover:bg-muted/50 ${
                              selectedResource === resource.metadata.uid ? "bg-muted" : ""
                            }`}
                            onClick={() => handleSelectResource(resource)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{resource.metadata.name}</span>
                              <div className="flex items-center gap-1">
                                {resource.metadata.namespace && (
                                  <Badge variant="secondary" className="text-xs">
                                    {resource.metadata.namespace}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteResource(resource.metadata.uid)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground p-2">No resources found for this CRD</div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right panel: YAML viewer/editor */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>View and copy resource YAML</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyYaml} className="gap-1">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] border rounded-md bg-muted/30">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{resourceYaml}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

