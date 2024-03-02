import { RESOURCE_ICON_SCALE, RESOURCE_ICON_WIDTH, getResourceMapping } from '../GameUtils'
import { type Scene } from '../scenes/Scene'
import { ImageCropper } from './ImageCropper'

export class AdvertisementInfoBuilder {
  scene: Scene
  cropper: ImageCropper

  constructor(scene: Scene) {
    this.cropper = new ImageCropper()
    this.scene = scene
  }

  build(playerId: string): Phaser.GameObjects.DOMElement {
    const adBubble = document.createElement('div')
    adBubble.className = 'adBubble'
    adBubble.id = `bubble-${playerId}`
    const adBubbleWrapper = document.createElement('div')
    adBubbleWrapper.className = 'adBubbleWrapper hidden'
    adBubbleWrapper.id = playerId
    adBubbleWrapper.appendChild(adBubble)

    return this.scene.add.dom(25, 15, adBubbleWrapper)
  }

  addBubble(div: HTMLDivElement, playerId: string): void {
    const bubbleContainer = document.getElementById(`bubble-${playerId}`)
    if (!bubbleContainer) return
    div.classList.add('adBubbleOffer')

    bubbleContainer.appendChild(div)
  }

  setMarginAndVisibility(playerId: string): void {
    const bubbleContainer = document.getElementById(`bubble-${playerId}`)
    if (!bubbleContainer) return

    bubbleContainer.classList.remove(`bubble-0`)
    bubbleContainer.classList.remove(`bubble-1`)
    bubbleContainer.classList.remove(`bubble-2`)
    bubbleContainer.classList.remove(`bubble-3`)
    bubbleContainer.classList.add(`bubble-${bubbleContainer.children.length}`)
  }

  addBubbleForResource(resourceName: string, playerId: string, buying: boolean): void {
    const bubbleContainer = document.getElementById(`bubble-${playerId}`)
    if (!bubbleContainer) return

    if (buying) {
      bubbleContainer.querySelectorAll('.bubbleReceive').forEach((el) => {
        el.remove()
      })
    } else {
      bubbleContainer.querySelectorAll('.bubbleGive').forEach((el) => {
        el.remove()
      })
    }

    if (resourceName === '') return

    const resourceImg = this.cropper.crop(
      RESOURCE_ICON_WIDTH,
      RESOURCE_ICON_WIDTH,
      RESOURCE_ICON_SCALE,
      this.scene.resourceUrl,
      this.scene.settings.classResourceRepresentation.length,
      getResourceMapping(this.scene.settings.classResourceRepresentation)(resourceName),
      false,
    )

    const iconImg = document.createElement('img')
    if (buying) {
      iconImg.src = '/assets/receiveCustomIcon.png'
    } else {
      iconImg.src = '/assets/giveCustomIcon.png'
    }

    const div = document.createElement('div')
    div.classList.add('adBubbleOffer')
    buying ? div.classList.add('bubbleReceive') : div.classList.add('bubbleGive')
    div.appendChild(iconImg)
    div.appendChild(resourceImg)
    bubbleContainer.appendChild(div)
  }

  addBubbleForCoop(travelName: string, playerId: string): void {
    const bubbleContainer = document.getElementById(`bubble-${playerId}`)
    if (!bubbleContainer) return

    bubbleContainer.querySelectorAll('.bubbleCoop').forEach((el) => {
      el.remove()
    })

    if (travelName === '') return

    const iconImg = document.createElement('img')
    iconImg.src = '/assets/coopCustomIcon.png'

    const travelNameSpan = document.createElement('span')
    travelNameSpan.innerText = travelName

    const div = document.createElement('div')
    div.classList.add('adBubbleOffer')
    div.classList.add('bubbleCoop')
    div.appendChild(iconImg)
    div.appendChild(travelNameSpan)
    bubbleContainer.appendChild(div)
  }

  cleanBubblesForPlayer(playerId: string, buying: boolean): void {
    if (buying) {
      document
        .getElementById(`bubble-${playerId}`)
        ?.querySelectorAll('.bubbleReceive')
        .forEach((el) => {
          el.remove()
        })
    } else {
      document
        .getElementById(`bubble-${playerId}`)
        ?.querySelectorAll('.bubbleGive')
        .forEach((el) => {
          el.remove()
        })
    }
  }

  showIfCloudNotVisible(): void {
    document.querySelectorAll('.adBubbleWrapper').forEach((el) => {
      if (!this.scene.interactionCloudBuiler.isVisible(el.id)) {
        el.classList.remove('hidden')
        el.classList.add('visible')
      } else {
        el.classList.remove('visible')
        el.classList.add('hidden')
      }
    })
  }

  hide(): void {
    document.querySelectorAll('.adBubbleWrapper').forEach((el) => {
      el.classList.remove('visible')
      el.classList.add('hidden')
    })
  }
}
