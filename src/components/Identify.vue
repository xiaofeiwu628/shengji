<template>
  <div class="s-canvas">
    <canvas ref="canvasRef" :width="contentWidth" :height="contentHeight"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  identifyCode: {
    type: String,
    default: '1234'
  },
  fontSizeMin: {
    type: Number,
    default: 25
  },
  fontSizeMax: {
    type: Number,
    default: 35
  },
  backgroundColorMin: {
    type: Number,
    default: 200
  },
  backgroundColorMax: {
    type: Number,
    default: 220
  },
  dotColorMin: {
    type: Number,
    default: 60
  },
  dotColorMax: {
    type: Number,
    default: 120
  },
  contentWidth: {
    type: Number,
    default: 90
  },
  contentHeight: {
    type: Number,
    default: 38
  }
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

function randomNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

function randomColor(min: number, max: number): string {
  const r = randomNum(min, max)
  const g = randomNum(min, max)
  const b = randomNum(min, max)
  return `rgb(${r},${g},${b})`
}

function drawText(ctx: CanvasRenderingContext2D, txt: string, i: number) {// 绘制文字
  ctx.fillStyle = randomColor(50, 160)
  ctx.font = `${randomNum(props.fontSizeMin, props.fontSizeMax)}px SimHei`
  const x = (i + 1) * (props.contentWidth / (props.identifyCode.length + 1))
  const y = randomNum(props.fontSizeMax, props.contentHeight - 5)
  const deg = randomNum(-30, 30)
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((deg * Math.PI) / 180)
  ctx.fillText(txt, 0, 0)
  ctx.restore()
}

function drawLine(ctx: CanvasRenderingContext2D) {// 绘制干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = randomColor(100, 200)
    ctx.beginPath()
    ctx.moveTo(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight))
    ctx.lineTo(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight))
    ctx.stroke()
  }
}

function drawDot(ctx: CanvasRenderingContext2D) {// 绘制干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = randomColor(0, 255)
    ctx.beginPath()
    ctx.arc(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight), 1, 0, 2 * Math.PI)
    ctx.fill()
  }
}

function drawPic() {// 绘制验证码
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.textBaseline = 'bottom'
  // 绘制背景
  ctx.fillStyle = '#e6ecfd'
  ctx.fillRect(0, 0, props.contentWidth, props.contentHeight)
  // 绘制文字
  for (let i = 0; i < props.identifyCode.length; i++) {
    drawText(ctx, props.identifyCode[i], i)
  }
  drawLine(ctx)
  drawDot(ctx)
}

watch(() => props.identifyCode, () => {// 监听验证码变化
  drawPic()
})

onMounted(() => {// 组件挂载后绘制验证码
  drawPic()
})
</script>

<style scoped>
/* 组件样式 */
.s-canvas {
  display: inline-block;
}
</style>