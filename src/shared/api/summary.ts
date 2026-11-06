/** 여러 API 응답에 같은 모양으로 들어가는 연관 대상 요약 객체 */

export interface WarehouseSummary {
  warehouseId: string
  warehouseCode: string
  regionCode: string
}

export interface SkuSummary {
  skuId: string
  skuCode: string
  productName: string
}

export interface ShipmentSummary {
  shipmentId: string
  shipmentCode: string
}

export interface RunSummary {
  runId: string
  runCode: string
  status: string
  resultClass: string | null
  /** `ON_HOLD`·`FAILED`일 때만 값이 있다 */
  failureCode: string | null
}
