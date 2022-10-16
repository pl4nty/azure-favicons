let defaultIcon = document.querySelector("link[rel=icon]")?.href

// CSS styling from _generated/Less/MsPortalImpl/Base/Base.Images.css
let styles;
fetch(chrome.runtime.getURL('msportalfx-svg.css')).then(res => res.text()).then(text => styles = text)

function loadIcon() {
  let refIcon = [...document.querySelector(".fxs-blade-header-icon use")].pop() // header
  || document.querySelector(".fxc-gcflink-icon use") // table row - some don't have icons eg Subscriptions
  || document.querySelector(".ext-hubs-artbrowse-emptyicon svg use") // optional overlays for table with no rows
  || document.querySelector(".ext-hubs-browse-emptyicon svg use") // as above
  || document.querySelector(".ext-overlay-image svg use") // as above
  || [...document.querySelectorAll('.fxs-portal-activated use')].pop() // blade without header eg Properties

  if (refIcon) {
    setSVGIcon(document.querySelector(refIcon.href.baseVal))
  } else {
    // MEM directly embeds SVGs
    let embedIcon = document.querySelector(".fxs-blade-header-icon svg") || document.querySelector('.fxs-portal-activated svg')
    if (embedIcon) {
      setSVGIcon(embedIcon)
    } else {
      // some blades use external icons eg costmanagement
      let externalIcon = document.querySelector(".fxs-blade-header-icon img")?.src
      setIcon(externalIcon || defaultIcon)
    }
  } 
}

function setSVGIcon(svgRef) {
  svgRef = svgRef.cloneNode(true)

  // Required XML namespace
  svgRef.setAttribute("xmlns", "http://www.w3.org/2000/svg")

  // SVG definition dependencies eg linearGradients
  svgRef.appendChild(document.querySelector('#DefsContainer defs').cloneNode(true))

  let style = document.createElement('style')
  style.innerHTML = styles
  svgRef.appendChild(style)

  // Hashes must be manually escaped: https://stackoverflow.com/a/63720894
  setIcon("data:image/svg+xml,"+svgRef.outerHTML.replaceAll('symbol','svg').replaceAll('#','%23'))
}

function setIcon(icon) {
  let link = document.querySelector("link[rel=icon]")
  link.removeAttribute('type')
  link.href = icon

  let shortcut = document.querySelector("link[rel='shortcut icon']")
  if (shortcut) {
    shortcut.removeAttribute('type')
    shortcut.href = icon
  }
}

// Hashchange doesn't always fire when changing blades
document.addEventListener('load', loadIcon, true);

// Some blades don't fire onload eg bulk operation results
// TODO is 500ms enough?
document.addEventListener('click', () => setTimeout(loadIcon, 500), true);
