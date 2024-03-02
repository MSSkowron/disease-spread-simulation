import { LAYER_SCALE } from '../GameUtils'
import { type Scene } from '../scenes/Scene'

export class LoadingBarAndResultBuilder {
  public static readonly loadingBarID = 'loadingBar'
  public static readonly containerID = 'loadingContainer'
  public static readonly containerDoneID = 'loadingContainerDone'
  public static readonly containerDoneInsideID = 'loadingContainerDoneInside'
  private readonly tileWidth: number
  private readonly tileHeight: number
  private readonly scene: Scene
  private readonly container: HTMLDivElement = document.createElement('div')
  private bar: HTMLDivElement | null = null
  private x: number | undefined
  private y: number | undefined
  private timeoutID: number | undefined

  constructor(tileWidth: number, tileHeight: number, scene: Scene) {
    this.tileWidth = tileWidth
    this.tileHeight = tileHeight
    this.scene = scene
  }

  setCoordinates(x: number, y: number): void {
    this.clear()
    this.x = x
    this.y = y
  }

  showLoadingBar(time: number): void {
    if (!this.x || !this.y) return
    this.clear()

    this.container.id = LoadingBarAndResultBuilder.containerID
    this.container.style.width = `${5 * this.tileWidth * LAYER_SCALE}px`
    this.container.style.height = `${0.5 * this.tileHeight * LAYER_SCALE}px`
    this.container.style.borderRadius = `${0.25 * this.tileHeight * LAYER_SCALE}px`

    this.bar = document.createElement('div')
    this.bar.id = LoadingBarAndResultBuilder.loadingBarID
    this.bar.style.width = `0%`
    this.bar.style.borderRadius = `${0.25 * this.tileHeight * LAYER_SCALE}px`
    this.container.appendChild(this.bar)

    this.scene.add.dom(
      (this.x + 0.5) * this.tileWidth * LAYER_SCALE,
      (this.y - 1) * this.tileHeight * LAYER_SCALE,
      this.container,
    )

    this.timeoutID = setTimeout(() => {
      this.load(25, time)
    }, 25)
  }

  private load(ticks: number, total: number): void {
    if (ticks > total) {
      return
    }

    this.bar!.style.width = `${(ticks * 100) / total}%`
    this.timeoutID = setTimeout(() => {
      this.load(ticks + 25, total)
    }, 25)
  }

  showResult(amount: number, img: HTMLDivElement): void {
    if (!this.x || !this.y) return
    this.clear()

    this.container.id = LoadingBarAndResultBuilder.containerDoneID
    this.container.style.width = `auto`
    this.container.style.height = `auto`
    this.container.style.borderRadius = `0`

    const plus = document.createElement('i')
    plus.ariaHidden = 'true'
    plus.className = 'fa fa-plus'
    const amountWrapper = document.createElement('div')
    const amountContainer = document.createElement('div')
    const amountMarker = document.createElement('h2')
    amountMarker.textContent = amount.toString()
    amountWrapper.appendChild(amountContainer)
    amountContainer.appendChild(amountMarker)

    const containerInside = document.createElement('div')
    containerInside.style.left = `${this.tileWidth * LAYER_SCALE}px`
    containerInside.id = LoadingBarAndResultBuilder.containerDoneInsideID
    this.container.appendChild(containerInside)
    containerInside.appendChild(plus)
    containerInside.appendChild(img)
    containerInside.appendChild(amountWrapper)

    this.scene.add.dom(
      (this.x + 0.5) * this.tileWidth * LAYER_SCALE,
      (this.y - 1.5) * this.tileHeight * LAYER_SCALE,
      this.container,
    )
    this.timeoutID = setTimeout(() => {
      this.clear()
      this.container.remove()
    }, 3000)
  }

  private clear(): void {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild)
    }
    this.bar = null
    clearTimeout(this.timeoutID)
  }
}
