"use client"

import yaml from "js-yaml"

// Convert object to YAML and download
export const downloadYaml = (data: any, filename: string) => {
  try {
    // Convert to YAML
    const yamlStr = yaml.dump(data, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true, // Don't output YAML references
    })

    // Create blob and download link
    const blob = new Blob([yamlStr], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
  } catch (error) {
    console.error("Error downloading YAML:", error)
  }
}

