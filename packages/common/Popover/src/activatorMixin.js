import popoverManager from './PopoverManager'

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      default: false
    },
    trigger: {
      type: String,
      default: 'hover'
    },
    delay: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 300
    },
    raw: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: null
    },
    controller: {
      type: Object,
      default: null
    }
  },
  computed: {
    triggeredByClick () {
      return this.trigger === 'click'
    },
    triggeredByHover () {
      return this.trigger === 'hover'
    },
    triggeredByManual () {
      return this.trigger === 'manual'
    },
    active () {
      if (this.trigger === 'manual') return this.value
      else return this.internalActive
    }
  },
  data () {
    return {
      internalActive: false,
      delayTimerId: null,
      vanishTimerId: null
    }
  },
  mounted () {
    // console.log('[Activator.mounted] id', this.id)
    // console.log('[Activator.mounted] active', this.active)
    popoverManager.registerActivator(this)
    this.registerListeners()
    if (this.controller) {
      this.controller.show = this.activate
      this.controller.hide = this.deactivate
    }
  },
  beforeUpdate () {
  },
  updated () {
    // console.log('Activator Updated', this.id)
    popoverManager.registerActivator(this)
    this.registerListeners()
    if (this.controller) {
      this.controller.show = this.activate
      this.controller.hide = this.deactivate
    }
  },
  beforeDestroy () {
    // console.log('Activator Destroyed', this.id)
    popoverManager.unregisterActivator(this)
    if (this.controller) {
      this.controller.show = null
      this.controller.hide = null
    }
  },
  methods: {
    activate () {
      const content = this.content()
      if (content && !content.active) {
        content.internalActive = true
      }
      this.internalActive = true
    },
    deactivate () {
      const content = this.content()
      if (content && content.active) {
        content.internalActive = false
      }
      this.internalActive = false
    },
    content () {
      // console.log(popoverManager, this)
      return popoverManager.getContentInstance(this)
    },
    handleClick () {
      if (this.triggeredByClick) {
        // console.log(`[Activator.handleClick]`)
        if (this.active) this.deactivate()
        else this.activate()
      }
    },
    handleMouseEnter () {
      window.clearTimeout(this.vanishTimerId)
      if (this.triggeredByHover) {
        this.delayTimerId = window.setTimeout(() => {
          this.activate()
          this.delayTimerId = null
        }, this.delay)
      }
    },
    handleMouseLeave () {
      window.clearTimeout(this.delayTimerId)
      if (this.triggeredByHover) {
        this.vanishTimerId = window.setTimeout(() => {
          this.deactivate()
          this.vanishTimerId = null
        }, this.duration)
      }
    },
    registerListeners () {
      const el = this.$el
      if (el) {
        el.removeEventListener('click', this.handleClick)
        el.removeEventListener('mouseenter', this.handleMouseEnter)
        el.removeEventListener('mouseleave', this.handleMouseLeave)
        if (this.triggeredByClick) {
          /// console.log('register click')
          el.addEventListener('click', this.handleClick)
        } else if (this.triggeredByHover) {
          // console.log('register hover')
          el.addEventListener('mouseenter', this.handleMouseEnter)
          el.addEventListener('mouseleave', this.handleMouseLeave)
        }
      }
    }
  }
}
