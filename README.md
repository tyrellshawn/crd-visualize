# Kubernetes CRD Visualizer

A modern web application for visualizing and managing Kubernetes Custom Resource Definitions (CRDs) and their relationships.

![Kubernetes CRD Visualizer](https://placeholder.svg?height=400&width=800)

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Connecting to a Cluster](#connecting-to-a-cluster)
  - [Using Mock Mode](#using-mock-mode)
  - [Visualizing CRDs](#visualizing-crds)
  - [Using the Graph View](#using-the-graph-view)
  - [Managing Missing Dependencies](#managing-missing-dependencies)
  - [Using the List View](#using-the-list-view)
  - [Using the Raw Data View](#using-the-raw-data-view)
  - [Schema Mapping](#schema-mapping)
  - [Searching Resources](#searching-resources)
  - [Downloading Resources](#downloading-resources)
- [Technical Implementation](#technical-implementation)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Advanced Features](#advanced-features)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- 📊 **Interactive Graph View**: Visualize CRDs and their relationships in an interactive graph
- 📋 **List View**: Browse CRDs and custom resources in a structured list
- 🔍 **Search Functionality**: Find resources by name, field values, or dependencies
- 🔄 **Cross-Cluster Visualization**: View and manage resources across multiple clusters
- 🔗 **Relationship Mapping**: Define and visualize relationships between different resource types
- 🚨 **Dependency Tracking**: Highlight resources with missing dependencies
- 📥 **Download Resources**: Export resources as YAML files
- 🌓 **Dark/Light Mode**: Support for both dark and light themes

## Getting Started

### Prerequisites

1. **Node.js**: Install Node.js 18.x or later
   ```bash
   # Check your Node.js version
   node --version
   
   # If you need to install or update Node.js, visit https://nodejs.org/

