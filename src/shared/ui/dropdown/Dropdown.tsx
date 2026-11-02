import { Check, ChevronDown } from 'lucide-react'
import { type ComponentProps, type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps extends Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'children'> {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  /** 고른 값이 없을 때 보여 주는 문구 */
  placeholder?: string
}

const TYPEAHEAD_RESET_MS = 500

/**
 * 목록에서 하나를 고르는 선택 상자. 라이브러리 없이 WAI-ARIA의 select-only combobox 패턴으로 만들었다.
 * 포커스는 항상 버튼에 있고, 목록의 강조는 aria-activedescendant로 알린다.
 * 키보드: ↑↓ 이동, Home/End 처음·끝, Enter/Space 열기·선택, Esc 닫기, 글자 입력으로 이름 찾기.
 */
export function Dropdown({
  className,
  options,
  value,
  onChange,
  placeholder = '선택',
  ...props
}: DropdownProps) {
  const listId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeaheadRef = useRef({ text: '', timer: 0 })
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = options[selectedIndex]
  const lastIndex = options.length - 1

  useEffect(() => {
    if (!open) {
      return
    }
    // 바깥을 누르면 닫는다. (Safari 등은 버튼을 눌러도 포커스가 가지 않아 blur만으로는 부족하다)
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open) {
      listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, activeIndex])

  useEffect(() => {
    const typeahead = typeaheadRef.current
    return () => window.clearTimeout(typeahead.timer)
  }, [])

  const openList = () => {
    setActiveIndex(Math.max(selectedIndex, 0))
    setOpen(true)
  }

  const choose = (index: number) => {
    const option = options[index]
    if (option) {
      onChange(option.value)
    }
    setOpen(false)
  }

  const moveActive = (index: number) => setActiveIndex(Math.min(Math.max(index, 0), lastIndex))

  // 같은 글자를 반복해서 누르면 그 글자로 시작하는 항목을 차례로 돈다.
  const findByTypeahead = (key: string) => {
    const typeahead = typeaheadRef.current
    window.clearTimeout(typeahead.timer)
    typeahead.text += key.toLowerCase()
    typeahead.timer = window.setTimeout(() => {
      typeahead.text = ''
    }, TYPEAHEAD_RESET_MS)

    const isRepeat = typeahead.text.split('').every((char) => char === typeahead.text[0])
    const prefix = isRepeat ? typeahead.text[0] : typeahead.text
    const from = (open ? activeIndex : Math.max(selectedIndex, 0)) + (isRepeat ? 1 : 0)
    for (let step = 0; step < options.length; step += 1) {
      const index = (from + step) % options.length
      if (options[index].label.toLowerCase().startsWith(prefix)) {
        return index
      }
    }
    return -1
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (options.length === 0) {
      return
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        if (!open) {
          openList()
          return
        }
        moveActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1))
        return
      }
      case 'Home':
      case 'End': {
        if (open) {
          event.preventDefault()
          moveActive(event.key === 'Home' ? 0 : lastIndex)
        }
        return
      }
      // Enter와 Space는 직접 처리한다. 브라우저가 따로 클릭을 일으켜 두 번 처리되지 않게 막는다.
      case 'Enter':
      case ' ': {
        event.preventDefault()
        if (open) {
          choose(activeIndex)
        } else {
          openList()
        }
        return
      }
      case 'Escape': {
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        return
      }
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
          return
        }
        const index = findByTypeahead(event.key)
        if (index >= 0) {
          if (!open) {
            setOpen(true)
          }
          setActiveIndex(index)
        }
      }
    }
  }

  return (
    <div
      ref={wrapperRef}
      data-slot="dropdown"
      className={cn('relative w-full', className)}
      onBlur={(event) => {
        // 탭 키 등으로 포커스가 밖으로 나가면 닫는다.
        if (!wrapperRef.current?.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        className={cn(
          'flex h-44pxr w-full min-w-0 cursor-pointer items-center justify-between gap-8pxr rounded-control border border-input bg-card pr-12pxr pl-12pxr text-left text-b1 text-foreground outline-none',
          'focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)] focus-visible:ring-[3px] focus-visible:ring-primary/20',
          'aria-expanded:border-primary aria-expanded:shadow-[inset_0_0_0_1px_var(--color-primary)] aria-expanded:ring-[3px] aria-expanded:ring-primary/20',
          'aria-invalid:border-danger aria-invalid:shadow-[inset_0_0_0_1px_var(--color-danger)] aria-invalid:ring-danger/20',
          'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-disabled-foreground',
        )}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        // Space를 떼는 순간 브라우저가 클릭을 일으키지 않게 막는다. (열기는 keydown에서 처리했다)
        onKeyUp={(event) => {
          if (event.key === ' ') {
            event.preventDefault()
          }
        }}
        {...props}
      >
        <span className={cn('min-w-0 truncate', !selectedOption && 'text-muted-foreground')}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-18pxr shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute top-full left-0 z-50 mt-8pxr max-h-280pxr w-full animate-popover-in overflow-auto rounded-card border border-border bg-card p-4pxr shadow-[0_8px_32px_rgba(37,35,49,0.12)] motion-reduce:animate-none"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              data-active={index === activeIndex}
              className={cn(
                'flex h-36pxr cursor-pointer items-center justify-between gap-8pxr rounded-control px-12pxr text-b1',
                'data-[active=true]:bg-muted',
                index === selectedIndex && 'font-bold text-primary',
              )}
              onMouseEnter={() => setActiveIndex(index)}
              // 버튼에서 포커스가 빠져 목록이 닫히지 않게 한다.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {index === selectedIndex && (
                <Check className="size-16pxr shrink-0" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
