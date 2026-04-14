/**
 * Recursively converts BigInt and Decimal values to JSON-serializable primitives
 * @param value - The value to serialize
 * @returns JSON-serializable value
 */
export function serializeToJSON(value: any): any {
  if (value === null || value === undefined) {
    return value
  }

  // Convert BigInt to Number
  if (typeof value === 'bigint') {
    return Number(value)
  }

  // Keep Date objects as-is (they're JSON-serializable)
  if (value instanceof Date) {
    return value
  }

  // Convert Decimal to Number
  if (typeof value === 'object' && value !== null) {
    // Check if it's a Decimal instance (has _isDecimal or constructor name)
    if (value.constructor?.name === 'Decimal' || '_isDecimal' in value) {
      return Number(value.toNumber ? value.toNumber() : value)
    }
    
    // Handle Decimal from @prisma/client
    if (value['d'] !== undefined || value['c'] !== undefined || value['e'] !== undefined) {
      return Number(value.toString())
    }

    // Recursively process objects and arrays
    if (Array.isArray(value)) {
      return value.map(item => serializeToJSON(item))
    }

    if (typeof value === 'object') {
      const result: any = {}
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = serializeToJSON(value[key])
        }
      }
      return result
    }
  }

  // Return primitive values as-is
  return value
}

/**
 * Alternative simple serializer for quick use in handlers
 * Converts BigInt and Decimal to Number
 */
export function toJSON(value: any): any {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'bigint') {
    return Number(value)
  }

  // Check for Decimal-like objects
  if (typeof value === 'object') {
    const str = value.toString?.()
    if (str && !isNaN(Number(str)) && str !== '[object Object]') {
      const num = Number(str)
      if (!isNaN(num)) {
        return num
      }
    }

    if (Array.isArray(value)) {
      return value.map(toJSON)
    }

    const result: any = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = toJSON(value[key])
      }
    }
    return result
  }

  return value
}
