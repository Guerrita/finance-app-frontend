"use client"

import { Component, type ReactNode } from "react"
import { ErrorState } from "@/components/shared/ErrorState"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <ErrorState
          message={this.state.error?.message}
          onRetry={() => this.setState({ hasError: false })}
        />
      )
    }
    return this.props.children
  }
}
