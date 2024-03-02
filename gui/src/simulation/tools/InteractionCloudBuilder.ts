import { type Scene } from '../scenes/Scene'
import { CloudType } from '../scenes/Types'

export class InteractionCloudBuilder {
  private readonly icons: Record<CloudType, HTMLElement> = {
    [CloudType.WORK]: this.createCloudIcon('/assets/workshopCloudCustomIcon.png'),
    [CloudType.TALK]: this.createCloudIcon('/assets/tradeCloudCustomIcon.png'),
    [CloudType.TRAVEL]: this.createCloudIcon('/assets/travelCloudCustomIcon.png'),
    [CloudType.PRODUCTION]: this.createCloudIcon('/assets/workshopCloudCustomIcon.png'),
  }

  private readonly notMovableIconTypes: CloudType[] = [
    CloudType.WORK,
    CloudType.TALK,
    CloudType.TRAVEL,
  ]

  private createCloudIcon(path: string): HTMLElement {
    const iconElement = document.createElement('img')
    iconElement.src = path
    return iconElement
  }

  build(scene: Scene, playerId: string): Phaser.GameObjects.DOMElement {
    const cloudContainer = document.createElement('div')
    cloudContainer.id = `cloud-${playerId}`
    cloudContainer.className = 'actionCloudContainer'

    return scene.add.dom(0, 0, cloudContainer)
  }

  showInteractionCloud(playerId: string, cloudType: CloudType): void {
    const cloudContainer = document.getElementById(`cloud-${playerId}`)
    if (!cloudContainer) return

    this.clearInteractionCloud(playerId)
    const cloudIcon = this.icons[cloudType].cloneNode(false) as HTMLElement
    cloudIcon.id = `${cloudType}-${playerId}`
    cloudContainer.appendChild(cloudIcon)
    cloudContainer.style.visibility = 'visible'
  }

  hideInteractionCloud(playerId: string, cloudType: CloudType): void {
    const cloudContainer = document.getElementById(`cloud-${playerId}`)
    if (cloudContainer) {
      document.getElementById(`${cloudType}-${playerId}`)?.remove()

      if (cloudContainer.childNodes.length === 0) {
        cloudContainer.style.visibility = 'hidden'
      }
    }
  }

  clearInteractionCloud(playerId: string): void {
    const cloudContainer = document.getElementById(`cloud-${playerId}`)
    if (!cloudContainer) return

    while (cloudContainer.firstChild) {
      cloudContainer.removeChild(cloudContainer.firstChild)
    }
  }

  purgeUnnecessaryIcons(playerId: string): void {
    this.notMovableIconTypes.forEach((cloudType) => {
      this.hideInteractionCloud(playerId, cloudType)
    })
  }

  isVisible(playerId: string): boolean {
    const cloudContainer = document.getElementById(`cloud-${playerId}`)
    if (!cloudContainer) {
      return false
    }

    return cloudContainer.style.visibility === 'visible'
  }
}
