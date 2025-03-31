"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getMockCrds, getMockCustomResources } from "@/lib/mock-data"

interface DataState {
  crds: any[]
  customResources: any[]
  customMappings: any[]
  addCrd: (crd: any) => void
  updateCrd: (uid: string, crd: any) => void
  deleteCrd: (uid: string) => void
  addCustomResource: (resource: any) => void
  updateCustomResource: (uid: string, resource: any) => void
  deleteCustomResource: (uid: string) => void
  addCustomMapping: (mapping: any) => void
  updateCustomMapping: (id: string, mapping: any) => void
  deleteCustomMapping: (id: string) => void
  resetToMockData: () => void
  exportData: () => { crds: any[]; customResources: any[]; customMappings: any[] }
  importData: (data: { crds: any[]; customResources: any[]; customMappings: any[] }) => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      crds: getMockCrds(),
      customResources: getMockCrds().flatMap((crd) => getMockCustomResources(crd.spec.names.plural)),
      customMappings: [],

      addCrd: (crd) =>
        set((state) => ({
          crds: [...state.crds, crd],
        })),

      updateCrd: (uid, crd) =>
        set((state) => ({
          crds: state.crds.map((c) => (c.metadata.uid === uid ? crd : c)),
        })),

      deleteCrd: (uid) =>
        set((state) => ({
          crds: state.crds.filter((c) => c.metadata.uid !== uid),
        })),

      addCustomResource: (resource) =>
        set((state) => ({
          customResources: [...state.customResources, resource],
        })),

      updateCustomResource: (uid, resource) =>
        set((state) => ({
          customResources: state.customResources.map((r) => (r.metadata.uid === uid ? resource : r)),
        })),

      deleteCustomResource: (uid) =>
        set((state) => ({
          customResources: state.customResources.filter((r) => r.metadata.uid !== uid),
        })),

      addCustomMapping: (mapping) =>
        set((state) => ({
          customMappings: [...state.customMappings, mapping],
        })),

      updateCustomMapping: (id, mapping) =>
        set((state) => ({
          customMappings: state.customMappings.map((m) => (m.id === id ? mapping : m)),
        })),

      deleteCustomMapping: (id) =>
        set((state) => ({
          customMappings: state.customMappings.filter((m) => m.id !== id),
        })),

      resetToMockData: () => {
        const mockCrds = getMockCrds()
        const mockResources = mockCrds.flatMap((crd) => getMockCustomResources(crd.spec.names.plural))
        set({
          crds: mockCrds,
          customResources: mockResources,
          customMappings: [],
        })
      },

      exportData: () => ({
        crds: get().crds,
        customResources: get().customResources,
        customMappings: get().customMappings,
      }),

      importData: (data) =>
        set({
          crds: data.crds || [],
          customResources: data.customResources || [],
          customMappings: data.customMappings || [],
        }),
    }),
    {
      name: "k8s-crd-visualizer-storage",
    },
  ),
)

