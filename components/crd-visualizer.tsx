"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CrdFlow from "@/components/crd-flow"
import { useDataStore } from "@/lib/data-store"
import DataManager from "@/components/data-manager"

export default function CrdVisualizer({ viewType }: { viewType: "graph" | "list" | "raw" | "edit" }) {
  const { crds, customResources, customMappings } = useDataStore()
  const [selectedCrd, setSelectedCrd] = useState<string | null>(null)
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all")
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredResources, setFilteredResources] = useState<any[]>([])

  // Load data and initialize state
  useEffect(() => {
    setLoading(true)
    setError(null)

    try {
      if (crds.length > 0) {
        // Set the first CRD as selected by default if none is selected
        if (!selectedCrd) {
          setSelectedCrd(crds[0].spec.names.kind)
        }

        // Extract all namespaces from resources
        const namespaceSet = new Set<string>(["all"])
        customResources.forEach((resource: any) => {
          if (resource.metadata?.namespace) {
            namespaceSet.add(resource.metadata.namespace)
          }
        })
        setNamespaces(Array.from(namespaceSet))

        // Filter resources based on selected CRD and namespace
        filterResources()
      }
    } catch (err) {
      console.error("Error initializing CRD visualizer:", err)
      setError(`Failed to initialize: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [crds, customResources, selectedCrd])

  // Filter resources based on selected CRD and namespace
  const filterResources = () => {
    if (!selectedCrd) {
      setFilteredResources([])
      return
    }

    let filtered = customResources.filter((resource) => resource.kind === selectedCrd)

    if (selectedNamespace !== "all") {
      filtered = filtered.filter((resource) => resource.metadata?.namespace === selectedNamespace)
    }

    setFilteredResources(filtered)
  }

  // Handle CRD selection change
  const handleCrdChange = (crdKind: string) => {
    if (crdKind === selectedCrd) return
    setSelectedCrd(crdKind)
  }

  // Handle namespace selection change
  const handleNamespaceChange = (namespace: string) => {
    if (namespace === selectedNamespace) return
    setSelectedNamespace(namespace)

    // Update filtered resources
    let filtered = customResources.filter((resource) => resource.kind === selectedCrd)

    if (namespace !== "all") {
      filtered = filtered.filter((resource) => resource.metadata?.namespace === namespace)
    }

    setFilteredResources(filtered)
  }

  // Refresh data
  const refreshData = () => {
    setLoading(true)

    // Re-filter resources
    filterResources()

    setLoading(false)
  }

  if (loading && filteredResources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading CRDs...</p>
      </div>
    )
  }

  if (error && filteredResources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refreshData}>Retry</Button>
      </div>
    )
  }

  if (crds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">No Custom Resource Definitions found.</p>
        <Button onClick={refreshData}>Refresh</Button>
      </div>
    )
  }

  const renderContent = () => {
    switch (viewType) {
      case "graph":
        return (
          <div className="h-full">
            <CrdFlow
              crds={crds}
              customResources={filteredResources}
              selectedCrd={selectedCrd}
              customMappings={customMappings}
            />
          </div>
        )
      case "list":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Custom Resources</CardTitle>
              <CardDescription>
                Showing {filteredResources.length} resources of type {selectedCrd}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Namespace</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Labels</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map((resource) => (
                      <TableRow key={resource.metadata.uid}>
                        <TableCell className="font-medium">{resource.metadata.name}</TableCell>
                        <TableCell>{resource.metadata.namespace || "N/A"}</TableCell>
                        <TableCell>
                          {resource.metadata.creationTimestamp
                            ? new Date(resource.metadata.creationTimestamp).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {resource.metadata.labels
                              ? Object.entries(resource.metadata.labels).map(([key, value]) => (
                                  <Badge key={key} variant="outline">
                                    {key}: {value as string}
                                  </Badge>
                                ))
                              : "None"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )
      case "raw":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Raw Data</CardTitle>
              <CardDescription>JSON representation of {filteredResources.length} resources</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <pre className="bg-muted p-4 rounded-md overflow-auto">
                  {JSON.stringify(filteredResources, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )
      case "edit":
        return (
          <div className="space-y-4">
            <DataManager />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="crd-select">Custom Resource Definition</Label>
          <Select value={selectedCrd || ""} onValueChange={handleCrdChange}>
            <SelectTrigger className="w-[250px]" id="crd-select">
              <SelectValue placeholder="Select CRD" />
            </SelectTrigger>
            <SelectContent>
              {crds.map((crd) => (
                <SelectItem key={crd.metadata.uid} value={crd.spec.names.kind}>
                  {crd.spec.names.kind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="namespace-select">Namespace</Label>
          <Select value={selectedNamespace} onValueChange={handleNamespaceChange}>
            <SelectTrigger className="w-[200px]" id="namespace-select">
              <SelectValue placeholder="Select Namespace" />
            </SelectTrigger>
            <SelectContent>
              {namespaces.map((namespace) => (
                <SelectItem key={namespace} value={namespace}>
                  {namespace === "all" ? "All Namespaces" : namespace}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end ml-auto">
          <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading && filteredResources.length > 0 ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        renderContent()
      )}
    </div>
  )
}

