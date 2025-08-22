# 003 - Andrew Martin Types (FOCUSED - Single File Fix)

## 🎯 **FOCUSED OBJECTIVE**
Fix **ONE FILE ONLY**: `src/types/andrew-martin.ts` 
Add missing type exports that are breaking Andrew Martin components.

## 📝 **MANAGEABLE SCOPE**
- **Single file**: `src/types/andrew-martin.ts`
- **5 missing exports** to add
- **Estimated time**: 30-45 minutes
- **Immediate commit** after completion

## 🔧 **EXACT CHANGES NEEDED**

### **Add These 5 Missing Exports**
```typescript
// Add to src/types/andrew-martin.ts

export interface Insight {
  id: string
  title: string
  summary: string
  category: string
  confidence: number
}

export interface NetworkStatusProps {
  guardianAngels: GuardianAngel[]
  networkHealth: number
  activeConnections: number
  successStories: SuccessStory[]
}

export interface RevenueAnalyticsProps {
  spaces: any[]
  totalRevenue: number
  growthRate: number
}

export interface SuccessStory {
  title: string
  summary: string
  link?: string
  date: string
}

export interface BusinessMetricsProps {
  kpis: KPIMetric[]
  trends: TrendIndicator[]
  alerts: BusinessAlert[]
  recommendations: AIRecommendation[]
}
```

## ✅ **SUCCESS CRITERIA**
1. **5 exports added** to `src/types/andrew-martin.ts`
2. **File compiles** without errors
3. **Commit changes** immediately
4. **No other files modified**

## 🚀 **SIMPLE VERIFICATION**
```bash
# Check if the specific imports work
npx tsc src/components/AndrewMartinControlPanel/widgets/BusinessInsightsPanel.tsx --noEmit
npx tsc src/components/AndrewMartinControlPanel/widgets/NetworkStatusWidget.tsx --noEmit
```

## 📋 **COMMIT MESSAGE**
```
feat: Add missing Andrew Martin type exports

- Add Insight interface for BusinessInsightsPanel
- Add NetworkStatusProps for NetworkStatusWidget  
- Add RevenueAnalyticsProps for RevenueAnalyticsChart
- Add SuccessStory interface for success stories
- Add BusinessMetricsProps for BusinessMetricsWidget

Fixes TypeScript compilation errors in Andrew Martin components.
```

---

## 🎯 **FOCUSED APPROACH**
- **One file, one commit**
- **Clear success criteria**
- **Immediate feedback loop**
- **Manageable scope for Jules**

**This task is designed for Jules to succeed quickly and build momentum!** 🌟 