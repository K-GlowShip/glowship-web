import { cn } from '@/shared/lib/cn'

import {
  PARTIAL_POLICY,
  PARTIAL_POLICY_LABEL,
  type PartialPolicy,
} from '../model/operating-rule-text'

interface PartialPolicyFieldProps {
  value: PartialPolicy
  onChange: (value: PartialPolicy) => void
}

const POLICIES = Object.values(PARTIAL_POLICY)

/** 부분 출고 허용 여부: 허용·불가·미정 중 하나를 고르는 한 줄짜리 선택. 고른 칸의 바탕이 옆 칸으로 미끄러진다 */
export function PartialPolicyField({ value, onChange }: PartialPolicyFieldProps) {
  return (
    <fieldset className="flex items-center justify-between gap-16pxr border-b border-border py-12pxr">
      <legend className="float-left text-b2 text-foreground">부분 출고</legend>
      <div className="rounded-control border border-input p-2pxr">
        {/* 칸 너비가 모두 같아서, 바탕을 고른 칸의 순서만큼 제 너비씩 옮기면 된다 */}
        <div className="relative grid grid-cols-3">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/3 rounded-[0.375rem] bg-primary-100 transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${POLICIES.indexOf(value) * 100}%)` }}
          />
          {POLICIES.map((policy) => (
            <label
              key={policy}
              className={cn(
                'relative cursor-pointer rounded-[0.375rem] px-16pxr py-6pxr text-center text-b2 transition-colors',
                'has-focus-visible:ring-[3px] has-focus-visible:ring-primary/30',
                value === policy
                  ? 'font-bold text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <input
                type="radio"
                name="partial-policy"
                value={policy}
                checked={value === policy}
                onChange={() => onChange(policy)}
                className="sr-only"
              />
              {PARTIAL_POLICY_LABEL[policy]}
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  )
}
