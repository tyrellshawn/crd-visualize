"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Upload, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useDataStore } from "@/lib/data-store"
import { downloadYaml } from "@/lib/download-utils"
import CrdBrowser from "@/components/crd-browser"
import CrdEditor from "@/components/crd-editor"
import RelationshipMapper from "@/components/relationship-mapper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import yaml from "js-yaml"

export default function DataManager() {
  const { exportData, importData, resetToMockData } = useDataStore()

  const handleExportData = () => {
    const data = exportData()
    downloadYaml(data, "k8s-crd-visualizer-data.yaml")
    toast.success("Data Exported", {
      description: "Your data has been exported to a YAML file",
    })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let data

        // Try to determine if it's JSON or YAML
        try {
          // First try to parse as JSON
          data = JSON.parse(content)
        } catch {
          // If not JSON, assume YAML
          data = yaml.load(content)
        }

        if (!data || typeof data !== "object") {
          toast.error("Invalid Data Format", {
            description: "The file does not contain valid data",
          })
          return
        }

        importData(data)
        toast.success("Data Imported", {
          description: "Imported data successfully",
        })

        // Reset the file input
        event.target.value = ""
      } catch (error) {
        toast.error("Import Error", {
          description: `Error importing data: ${(error as Error).message}`,
        })
      }
    }

    reader.onerror = () => {
      toast.error("File Error", {
        description: "Error reading file",
      })
    }

    reader.readAsText(file)
  }

  const handleResetToMockData = () => {
    resetToMockData()
    toast.success("Data Reset", {
      description: "Your data has been reset to the default mock data",
    })
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between mb-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData} className="gap-1">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <div className="relative">
              <input
                type="file"
                id="import-data"
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                accept=".yaml,.yml,.json"
                onChange={handleImportData}
              />
              <Button variant="outline" className="gap-1">
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <RefreshCw className="h-4 w-4" />
                Reset to Mock Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Data</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reset all data to the default mock data? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    document
                      .querySelector('[data-state="open"] button[aria-label="Close"]')
                      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
                  }
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleResetToMockData()
                    document
                      .querySelector('[data-state="open"] button[aria-label="Close"]')
                      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
                  }}
                >
                  Reset Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="browse">
          <TabsList className="mb-6">
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="add">Add Resources</TabsTrigger>
            <TabsTrigger value="relationships">Define Relationships</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <CrdBrowser />
          </TabsContent>

          <TabsContent value="add">
            <CrdEditor />
          </TabsContent>

          <TabsContent value="relationships">
            <RelationshipMapper />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

