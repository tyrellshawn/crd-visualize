"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node, Edge } from "reactflow"
import { getValueByPath } from "@/lib/search-utils"

interface SearchPanelProps {
  nodes: Node[]
  edges: Edge[]
  onSearchResults: (nodeIds: string[]) => void
  onClose: () => void
}

type SearchMode = "name" | "field" | "dependencies"

export default function SearchPanel({ nodes, edges, onSearchResults, onClose }: SearchPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchMode, setSearchMode] = useState<SearchMode>("name")
  const [searchField, setSearchField] = useState("metadata.name")
  const [includeDependencies, setIncludeDependencies] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState<Node[]>([])

  // Common fields that can be searched
  const commonFields = [
    { label: "Name", value: "metadata.name" },
    { label: "Namespace", value: "metadata.namespace" },
    { label: "UID", value: "metadata.uid" },
    { label: "Kind", value: "kind" },
    { label: "API Version", value: "apiVersion" },
    { label: "Label", value: "metadata.labels" },
    { label: "Annotation", value: "metadata.annotations" },
  ]

  // Memoized search function to prevent unnecessary recalculations
  const performSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setResults([])
      return []
    }

    let matchedNodes: Node[] = []

    if (searchMode === "name") {
      // Search by name (case insensitive)
      matchedNodes = nodes.filter((node) => node.data.label.toLowerCase().includes(searchTerm.toLowerCase()))
    } else if (searchMode === "field") {
      // Search by specific field
      matchedNodes = nodes.filter((node) => {
        const value = getValueByPath(node.data.data, searchField)
        if (value === undefined) return false

        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase())
        } else if (typeof value === "object") {
          // For objects like labels or annotations, search in all values
          return Object.values(value).some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
        }
        return String(value).includes(searchTerm)
      })
    } else if (searchMode === "dependencies") {
      // First find nodes that match the search term
      const directMatches = nodes.filter((node) => node.data.label.toLowerCase().includes(searchTerm.toLowerCase()))

      matchedNodes = [...directMatches]

      if (includeDependencies) {
        // Find dependencies (nodes connected by edges)
        const matchedIds = new Set(directMatches.map((node) => node.id))
        const dependencyIds = new Set<string>()

        // Add all connected nodes (both directions)
        edges.forEach((edge) => {
          if (matchedIds.has(edge.source)) {
            dependencyIds.add(edge.target)
          }
          if (matchedIds.has(edge.target)) {
            dependencyIds.add(edge.source)
          }
        })

        // Add dependency nodes to results
        nodes.forEach((node) => {
          if (dependencyIds.has(node.id) && !matchedIds.has(node.id)) {
            matchedNodes.push(node)
          }
        })
      }
    }

    return matchedNodes
  }, [searchTerm, searchMode, searchField, includeDependencies, nodes, edges])

  // Update results when search parameters change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([])
      onSearchResults([])
      return
    }

    const matchedNodes = performSearch()

    // Only update if results have actually changed
    if (JSON.stringify(matchedNodes.map((n) => n.id).sort()) !== JSON.stringify(results.map((n) => n.id).sort())) {
      setResults(matchedNodes)

      // Only notify parent component of results if we have any
      // This prevents unnecessary re-renders
      const resultIds = matchedNodes.map((node) => node.id)

      // Use a timeout to break the potential update cycle
      const timeoutId = setTimeout(() => {
        onSearchResults(resultIds)
      }, 50)

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, searchMode, searchField, includeDependencies])

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Handle selecting a specific result
  const handleSelectResult = (nodeId: string) => {
    onSearchResults([nodeId])
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Search Resources</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1.5 h-6 w-6" onClick={clearSearch}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-1">
              <Label htmlFor="search-mode">Search Mode</Label>
              <Select value={searchMode} onValueChange={(value: SearchMode) => setSearchMode(value)}>
                <SelectTrigger id="search-mode">
                  <SelectValue placeholder="Search Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">By Name</SelectItem>
                  <SelectItem value="field">By Field</SelectItem>
                  <SelectItem value="dependencies">With Dependencies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchMode === "field" && (
              <div className="space-y-1">
                <Label htmlFor="search-field">Search Field</Label>
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger id="search-field">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {searchMode === "dependencies" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-dependencies"
                  checked={includeDependencies}
                  onCheckedChange={(checked) => setIncludeDependencies(checked as boolean)}
                />
                <Label htmlFor="include-dependencies">Include Dependencies</Label>
              </div>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <Label>Results ({results.length})</Label>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {results.map((node) => (
                <div
                  key={node.id}
                  className="p-2 text-sm rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectResult(node.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{node.data.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {node.data.kind}
                    </Badge>
                  </div>
                  {node.data.namespace && (
                    <div className="text-xs text-muted-foreground mt-1">Namespace: {node.data.namespace}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

