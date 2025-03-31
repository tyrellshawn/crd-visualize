import { Suspense } from "react"
import ClusterSelector from "@/components/cluster-selector"
import CrdVisualizer from "@/components/crd-visualizer"
import DataManager from "@/components/data-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SonnerProvider } from "@/components/sonner-provider"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Kubernetes CRD Visualizer (Demo)</h1>

      <div className="flex justify-between items-center mb-6">
        <ClusterSelector />
      </div>

      <Tabs defaultValue="graph" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="graph">Graph View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
          <TabsTrigger value="edit">Edit Data</TabsTrigger>
        </TabsList>
        <TabsContent value="graph" className="h-[70vh]">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading graph view...</div>}>
            <CrdVisualizer viewType="graph" />
          </Suspense>
        </TabsContent>
        <TabsContent value="list">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading list view...</div>}>
            <CrdVisualizer viewType="list" />
          </Suspense>
        </TabsContent>
        <TabsContent value="raw">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading raw data...</div>}>
            <CrdVisualizer viewType="raw" />
          </Suspense>
        </TabsContent>
        <TabsContent value="edit">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading editor...</div>}>
            <DataManager />
          </Suspense>
        </TabsContent>
      </Tabs>

      <SonnerProvider />
    </main>
  )
}

