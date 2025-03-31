"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Save, Upload, FileText } from "lucide-react"
import { toast } from "sonner"
import yaml from "js-yaml"
import { useDataStore } from "@/lib/data-store"

export default function CrdEditor() {
  const { addCrd, addCustomResource, crds } = useDataStore()
  const [yamlContent, setYamlContent] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")

  // Handle YAML content change
  const handleYamlChange = (content: string) => {
    setYamlContent(content)
    setParseError(null)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string
      setYamlContent(content)
    }

    reader.onerror = () => {
      setParseError("Error reading file")
    }

    reader.readAsText(file)
  }

  // Parse YAML content and extract resources
  const parseYamlContent = () => {
    try {
      // Handle multi-document YAML
      const documents: any[] = []

      // Use yaml.loadAll to handle multi-document YAML
      yaml.loadAll(yamlContent, (doc) => {
        if (doc) documents.push(doc)
      })

      if (documents.length === 0) {
        setParseError("No valid YAML documents found")
        return []
      }

      return documents
    } catch (error) {
      setParseError(`YAML parse error: ${(error as Error).message}`)
      return []
    }
  }

  // Handle save
  const handleSave = () => {
    const documents = parseYamlContent()
    if (documents.length === 0) return

    let crdCount = 0
    let resourceCount = 0

    documents.forEach((doc) => {
      try {
        // Validate basic structure
        if (!doc.kind) {
          setParseError("Resource must have a 'kind' field")
          return
        }

        if (!doc.apiVersion) {
          setParseError("Resource must have an 'apiVersion' field")
          return
        }

        // Add a UID if not present
        if (!doc.metadata?.uid) {
          if (!doc.metadata) doc.metadata = {}
          doc.metadata.uid = `${doc.kind.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        }

        // Check if it's a CRD or a custom resource
        if (doc.kind === "CustomResourceDefinition") {
          addCrd(doc)
          crdCount++
        } else {
          addCustomResource(doc)
          resourceCount++
        }
      } catch (error) {
        setParseError(`Error processing document: ${(error as Error).message}`)
      }
    })

    if (crdCount > 0 || resourceCount > 0) {
      toast.success("Resources Added", {
        description: `Added ${crdCount} CRDs and ${resourceCount} custom resources`,
      })

      // Clear the form
      setYamlContent("")
      setFileName("")
    }
  }

  // Generate a sample CRD
  const insertSampleCrd = () => {
    const sampleCrd = `# CRD for Student
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: students.school.example.com
spec:
  group: school.example.com
  versions:
    - name: v1alpha1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                studentId:
                  type: string
                name:
                  type: string
                enrolledCourses:
                  type: array
                  items:
                    type: string
  scope: Namespaced
  names:
    plural: students
    singular: student
    kind: Student
    shortNames:
      - stu`

    setYamlContent(sampleCrd)
  }

  // Generate a sample custom resource
  const insertSampleResource = () => {
    // Find a CRD to base the sample on
    const crd = crds[0]

    if (!crd) {
      toast.error("No CRDs Available", {
        description: "Please add a CRD first to generate a sample resource",
      })
      return
    }

    const kind = crd.spec.names.kind
    const apiVersion = `${crd.spec.group}/${crd.spec.versions[0].name}`

    const sampleResource = `# Sample ${kind} Resource
apiVersion: ${apiVersion}
kind: ${kind}
metadata:
  name: sample-${kind.toLowerCase()}
  namespace: default
spec:
  # Add properties based on the CRD schema
`

    setYamlContent(sampleResource)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resource Editor</CardTitle>
        <CardDescription>Add CRDs and custom resources by pasting YAML or uploading a file</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={insertSampleCrd} className="gap-1">
              <FileText className="h-4 w-4" />
              Insert Sample CRD
            </Button>
            <Button variant="outline" onClick={insertSampleResource} className="gap-1">
              <FileText className="h-4 w-4" />
              Insert Sample Resource
            </Button>
            <div className="flex-1"></div>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                accept=".yaml,.yml,.json"
                onChange={handleFileUpload}
              />
              <Button variant="outline" className="gap-1">
                <Upload className="h-4 w-4" />
                {fileName || "Upload File"}
              </Button>
            </div>
          </div>

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-[400px] border rounded-md">
            <Textarea
              placeholder="# Paste your YAML here...
# You can include multiple resources separated by ---"
              className="min-h-[400px] font-mono resize-none border-0"
              value={yamlContent}
              onChange={(e) => handleYamlChange(e.target.value)}
            />
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="gap-1">
          <Save className="h-4 w-4" />
          Save Resource
        </Button>
      </CardFooter>
    </Card>
  )
}

