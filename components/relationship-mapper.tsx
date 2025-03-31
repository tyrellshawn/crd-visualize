"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, Save, Trash2 } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { toast } from "sonner"

export default function RelationshipMapper() {
  const { crds, customMappings, addCustomMapping, deleteCustomMapping } = useDataStore()
  const [sourceKind, setSourceKind] = useState<string>("")
  const [targetKind, setTargetKind] = useState<string>("")
  const [sourceField, setSourceField] = useState<string>("")
  const [targetField, setTargetField] = useState<string>("")
  const [mappingName, setMappingName] = useState<string>("")
  const [mappingDescription, setMappingDescription] = useState<string>("")
  const [sourceFields, setSourceFields] = useState<string[]>([])
  const [targetFields, setTargetFields] = useState<string[]>([])

  // Extract fields from CRD schema
  const extractFields = (crdKind: string): string[] => {
    const crd = crds.find((c) => c.spec.names.kind === crdKind)
    if (!crd) return []

    const fields: string[] = []
    const schema = crd.spec.versions[0]?.schema?.openAPIV3Schema

    if (schema?.properties?.spec?.properties) {
      Object.keys(schema.properties.spec.properties).forEach((key) => {
        fields.push(`spec.${key}`)
      })
    }

    if (schema?.properties?.metadata?.properties) {
      Object.keys(schema.properties.metadata.properties).forEach((key) => {
        fields.push(`metadata.${key}`)
      })
    }

    // Add common fields if not already included
    if (!fields.includes("metadata.name")) fields.push("metadata.name")
    if (!fields.includes("metadata.namespace")) fields.push("metadata.namespace")
    if (!fields.includes("metadata.labels")) fields.push("metadata.labels")

    return fields
  }

  // Update source fields when source kind changes
  useEffect(() => {
    if (sourceKind) {
      setSourceFields(extractFields(sourceKind))
    } else {
      setSourceFields([])
    }
    setSourceField("")
  }, [sourceKind])

  // Update target fields when target kind changes
  useEffect(() => {
    if (targetKind) {
      setTargetFields(extractFields(targetKind))
    } else {
      setTargetFields([])
    }
    setTargetField("")
  }, [targetKind])

  // Handle saving a new mapping
  const handleSaveMapping = () => {
    if (!sourceKind || !targetKind || !sourceField || !targetField || !mappingName) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields",
      })
      return
    }

    const sourceCrd = crds.find((c) => c.spec.names.kind === sourceKind)
    const targetCrd = crds.find((c) => c.spec.names.kind === targetKind)

    if (!sourceCrd || !targetCrd) {
      toast.error("CRD Not Found", {
        description: "Source or target CRD not found",
      })
      return
    }

    const newMapping = {
      id: `mapping-${Date.now()}`,
      name: mappingName,
      sourceKind,
      sourceApiVersion: `${sourceCrd.spec.group}/${sourceCrd.spec.versions[0].name}`,
      sourceField,
      targetKind,
      targetApiVersion: `${targetCrd.spec.group}/${targetCrd.spec.versions[0].name}`,
      targetField,
      description: mappingDescription,
    }

    addCustomMapping(newMapping)

    toast.success("Mapping Created", {
      description: `Created mapping from ${sourceKind} to ${targetKind}`,
    })

    // Reset form
    setMappingName("")
    setMappingDescription("")
    setSourceField("")
    setTargetField("")
  }

  // Handle deleting a mapping
  const handleDeleteMapping = (id: string) => {
    deleteCustomMapping(id)
    toast.success("Mapping Deleted", {
      description: "The relationship mapping has been deleted",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Relationship Mapper</CardTitle>
        <CardDescription>Define relationships between different resource types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Resource */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="source-kind">Source Resource Type</Label>
              <Select value={sourceKind} onValueChange={setSourceKind}>
                <SelectTrigger id="source-kind">
                  <SelectValue placeholder="Select resource type" />
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

            {sourceKind && (
              <div>
                <Label htmlFor="source-field">Source Field</Label>
                <Select value={sourceField} onValueChange={setSourceField}>
                  <SelectTrigger id="source-field">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Target Resource */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="target-kind">Target Resource Type</Label>
              <Select value={targetKind} onValueChange={setTargetKind}>
                <SelectTrigger id="target-kind">
                  <SelectValue placeholder="Select resource type" />
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

            {targetKind && (
              <div>
                <Label htmlFor="target-field">Target Field</Label>
                <Select value={targetField} onValueChange={setTargetField}>
                  <SelectTrigger id="target-field">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Mapping Details */}
        {sourceKind && targetKind && sourceField && targetField && (
          <div className="mt-6 space-y-4">
            <div className="p-4 border rounded-md bg-muted/30">
              <div className="flex items-center justify-center gap-4">
                <div className="text-right">
                  <div className="font-medium">{sourceKind}</div>
                  <div className="text-sm text-muted-foreground">{sourceField}</div>
                </div>
                <ArrowRight className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="font-medium">{targetKind}</div>
                  <div className="text-sm text-muted-foreground">{targetField}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mapping-name">Mapping Name</Label>
                <Input
                  id="mapping-name"
                  value={mappingName}
                  onChange={(e) => setMappingName(e.target.value)}
                  placeholder="e.g., Application-ConfigMap"
                />
              </div>
              <div>
                <Label htmlFor="mapping-description">Description (Optional)</Label>
                <Input
                  id="mapping-description"
                  value={mappingDescription}
                  onChange={(e) => setMappingDescription(e.target.value)}
                  placeholder="e.g., Maps Application to its ConfigMap"
                />
              </div>
            </div>
          </div>
        )}

        {/* Existing Mappings */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Existing Mappings</h3>
          {customMappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              <p>No mappings defined yet. Create a mapping to see it here.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">{mapping.name}</TableCell>
                      <TableCell>
                        <div>{mapping.sourceKind}</div>
                        <div className="text-xs text-muted-foreground">{mapping.sourceField}</div>
                      </TableCell>
                      <TableCell>
                        <div>{mapping.targetKind}</div>
                        <div className="text-xs text-muted-foreground">{mapping.targetField}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMapping(mapping.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSaveMapping}
          disabled={!sourceKind || !targetKind || !sourceField || !targetField || !mappingName}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Mapping
        </Button>
      </CardFooter>
    </Card>
  )
}

