declare module "react-simple-maps" {
  import { ComponentProps, ReactNode } from "react"

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    style?: React.CSSProperties
    className?: string
    height?: number
    width?: number
    children?: ReactNode
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element

  export interface ZoomableGroupProps {
    zoom?: number
    minZoom?: number
    maxZoom?: number
    center?: [number, number]
    children?: ReactNode
  }
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element

  export interface GeographiesProps {
    geography: string | object
    children: (args: { geographies: Geography[] }) => ReactNode
  }
  export function Geographies(props: GeographiesProps): JSX.Element

  export interface Geography {
    rsmKey: string
    properties: Record<string, unknown>
    [key: string]: unknown
  }

  export interface GeographyProps {
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onMouseEnter?: (e: React.MouseEvent, geo: Geography) => void
    onMouseLeave?: (e: React.MouseEvent) => void
  }
  export function Geography(props: GeographyProps): JSX.Element
}
