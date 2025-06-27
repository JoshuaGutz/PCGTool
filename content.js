// ==UserScript==
// @name         Hide Specific Items in Grid
// @namespace    http://your.website.com/your-extension/
// @version      1.0
// @description  Hides specific items in an item grid based on their text content. Designed for dynamic, iframe-based content.
// @match        https://your-target-website.com/* // Make sure this matches the main page URL pattern
// @grant        none
// @run-at       document_start
// @all_frames   true // *** CRITICAL: Inject script into all frames, including iframes ***
// ==/UserScript==

/*
   This script hides specific items on a web page that are rendered within item grids,
   especially on pages with dynamic content loaded after initial page load and/or
   content nested within iframes.

   Key Concepts & Why They Are Used:

   1.  all_frames: true (in manifest.json and shown above):
       - Problem: Content is in iframes, standard script in main frame can't access.
       - Solution: Injects the script into *every* matching frame (main + iframes).
                   The script then runs independently in each frame's document context.

   2.  run-at: document_start (in manifest.json and shown above):
       - Problem: Dynamic content might be added by page scripts running very early.
       - Solution: Injects the script as early as possible, giving our observers
                   the best chance to attach before significant DOM manipulation.

   3.  DOMContentLoaded Listener:
       - Problem: Accessing document.body or setting up observers on elements that
                  don't exist yet (like document.body at document_start) causes errors.
       - Solution: Waits for the basic HTML document to be parsed and document.body
                   to be available (guaranteed by DOMContentLoaded) before setting
                   up the main MutationObserver on the body.

   4.  MutationObserver:
       - Problem: Dynamic content is added *after* standard load events (like DOMContentLoaded).
                  Standard selectors only find elements present *at the time of query*.
       - Solution: Actively watches the DOM for changes (node additions). Our observer
                   triggers whenever elements are added, allowing us to react to the
                   dynamic appearance of content.

   5.  Body MutationObserver (Watching document.body with subtree: true):
       - Problem: Item grids/buttons might be added anywhere within the body, or in pieces.
                  We need to detect *any* potential item-related addition.
       - Solution: Observes the entire body and its descendants for added nodes.
                   When an element node is added, it triggers a check.

   6.  Debounced Rescan Triggered by Body Observer:
       - Problem: Adding many single nodes rapidly can cause the observer to fire too often,
                  leading to inefficient repeated full rescans.
       - Problem: A simple check on the added node might miss complex additions where
                  classes/structure are applied just after the node is added.
       - Solution: When *any* element node is added, we don't immediately rescan.
                   Instead, we set a short timer (debounce). If another node is added
                   before the timer finishes, the timer resets. The actual rescan
                   only happens after a brief pause in DOM additions. The rescan
                   then uses document.querySelectorAll on the *entire document* (of
                   the current frame) to find all .item-grid elements, which are
                   more reliable markers for item lists.

   7.  Observing Individual .item-grid Elements:
       - Problem: Once .item-grid elements are found (either initially or via body observer),
                  items might be added *within* those grids later.
       - Solution: For each found .item-grid element, we set up a *separate*, more
                   specific MutationObserver to watch *only* that grid. When it triggers,
                   we re-apply the hiding logic just to the content within that grid.

   8.  Scoped applyHidingLogic(scopeElement):
       - Problem: Need to search for target elements within different parts of the DOM
                  (the whole document, a specific added node, a specific grid).
       - Solution: The core hiding logic is in a function that accepts a `scopeElement`.
                   `scopeElement.querySelectorAll(...)` searches only within that scope.

   9.  Correct Selector and Hiding Target:
       - Problem: Initially used incorrect selector, then targeted the wrong element for hiding.
       - Solution: Used the confirmed selector '.item-grid > div > .item-entry-button > span.item-entry-button__name > div'
                   to find the text, and then accurately used .closest('.item-entry-button').parentElement
                   to find the correct parent div to hide.

   10. Initial Check on DOMContentLoaded:
       - Problem: Some items might already be present when DOMContentLoaded fires before
                  the body observer has a chance to detect their addition.
       - Solution: Perform a scan for .item-grid elements right after setting up the body observer
                   (within the DOMContentLoaded listener) to catch elements present early.

   This layered approach, starting with the broadest detection (body observer + rescan)
   to find the containers (.item-grid), and then setting up specific observers on those
   containers, is robust for highly dynamic and possibly piecemeal content loading
   within iframes.
*/


// Define the list of text contents you want to hide
const contentToHide = [
  "Basic Ball",
  "Beast Ball",
  // "Cherish Ball",
  "Cipher Ball",
  // "Clone Ball",
  "Fantasy Ball",
  "Fast Ball",
  "Feather Ball",
  // "Friend Ball",
  "Frozen Ball",
  "Geo Ball",
  // "Great Cherish Ball",
  "Heal Ball",
  "Heavy Ball",
  "Level Ball",
  "Luxury Ball",
  "Mach Ball",
  "Magnet Ball",
  // "Master Ball",
  // "Nest Ball",
  "Net Ball",
  "Night Ball",
  "Phantom Ball",
  // "Premier Ball",
  // "Quick Ball",
  // "Repeat Ball",
  // "Stone Ball",
  "Sun Ball",
  // "Timer Ball",
  // "Ultra Ball",
  // "Ultra Cherish Ball"
  // Add all the exact text contents you want to hide here.
  // Remember this list is case-sensitive and whitespace-sensitive.
];

console.log(`[Content Script] Starting script in frame: ${window.location.href}`);


// Store references to the observers if needed for disconnection (optional, for cleanup)
// const gridObservers = new Set();

// Function containing the core logic to find and hide elements
// It searches within the provided scopeElement for target text content divs
// and hides their parent element in the confirmed hierarchy.
function applyHidingLogic(scopeElement) {
  // Select target elements (the innermost div with the text content) within the scope
  // Uses the full selector path. querySelectorAll on an element searches only its descendants.
  const textContentElements = scopeElement.querySelectorAll('.item-grid > div > .item-entry-button > span.item-entry-button__name ');

  // console.log(`[Content Script] Applying hiding logic within scope:`, scopeElement); // Too frequent log?
  if (textContentElements.length > 0) {
      console.log(`[Content Script] Found ${textContentElements.length} potential text content elements within scope.`);
  }


  textContentElements.forEach(textContentElement => {
    const itemTextContent = textContentElement.textContent.trim();

    // console.log(`[Content Script] Checking text content: "${itemTextContent}"`); // Too frequent log?

    if (contentToHide.includes(itemTextContent)) {
      console.log(`[Content Script] Match found: "${itemTextContent}". Attempting to hide parent.`);

      // Find the closest element with the class 'item-entry-button'
      const itemButton = textContentElement.closest('.item-entry-button');

      if (itemButton) {
        // Get the direct parent element of the .item-entry-button element
        // Based on hierarchy: .item-grid > div (THIS IS THE TARGET) > .item-entry-button
        const parentDivToHide = itemButton.parentElement;

        if (parentDivToHide) {
            // Check if the parent div is already hidden before trying to hide again
            if (parentDivToHide.style.display !== 'none') {
                parentDivToHide.style.display = 'none'; // Set display to none for the target parent div
                console.log(`[Content Script] Action: Hidden parent div of .item-entry-button for text: "${itemTextContent}"`);
            } // else { console.log(`[Content Script] Parent div for "${itemTextContent}" already hidden.`); }
        } else {
             console.log(`[Content Script] Warning: Parent div of .item-entry-button not found for element containing text: "${itemTextContent}"`);
        }
      } else {
        // This warning indicates the selector path from text div up to .item-entry-button is broken
        console.log(`[Content Script] Warning: .item-entry-button parent not found via closest() for element containing text: "${itemTextContent}"`);
      }
    }
  });
}

// Function to set up a specific MutationObserver for a single .item-grid element
// This watches for changes *within* a grid once it's found.
function observeItemGrid(itemGridElement) {
    // Prevent setting up multiple observers on the exact same element instance.
    // While Set tracking helps globally, checking observation state is more robust.
    // (MutationObserver API doesn't offer a simple way to check if an element is observed by *an* observer)
    // For simplicity here, we rely on the observedGrids Set check in processFoundGrids.

    console.log("[Content Script] Setting up MutationObserver for .item-grid element:", itemGridElement);

    const observer = new MutationObserver(mutations => {
      // console.log("[Content Script] MutationObserver for a .item-grid triggered."); // Suppress frequent log
      // When a mutation happens within this specific .item-grid, re-apply the hiding logic
      // specifically within the scope of this itemGridElement. This catches items added/changed inside the grid.
      applyHidingLogic(itemGridElement);
    });

    // Start observing this specific .item-grid element for added nodes and subtree changes
    // subtree: true is crucial to catch additions deep within the grid's structure.
    observer.observe(itemGridElement, { childList: true, subtree: true });

    // Optional: Add the observer to our set for potential future disconnection
    // gridObservers.add(observer);
}


// --- Main Logic: Wait for DOMContentLoaded to safely setup Body Observer ---
// DOMContentLoaded ensures document.body exists before we try to observe it.
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Content Script] DOMContentLoaded event fired. Setting up Body MutationObserver...");

    // Use a Set to keep track of grids we have already processed and observed
    // to avoid setting up duplicate observers on the same grid element instances.
    const observedGrids = new Set();

    // Helper function to process a list of found .item-grid elements.
    // Applies hiding logic and sets up grid-specific observers if not already observed.
    function processFoundGrids(grids) {
         grids.forEach(grid => {
             // Check if we have already processed and set up an observer for this grid element instance.
             if (!observedGrids.has(grid)) {
                 console.log("[Content Script] Processing new .item-grid:", grid);
                 // 1. Apply hiding logic to any items already inside this new grid.
                 //    We pass the grid as the scope.
                 applyHidingLogic(grid);
                 // 2. Set up a specific MutationObserver to watch for future changes within this grid.
                 observeItemGrid(grid);
                 // 3. Add this grid element instance to our set of observed grids.
                 observedGrids.add(grid);
             } else {
                 // If the body observer finds a grid we already observe, it means changes
                 // are still happening in a way that touches the grid element itself.
                 // Re-running applyHidingLogic on it is a safe way to catch any items
                 // added/modified in a complex mutation involving an already observed grid.
                 // console.log("[Content Script] Already observing this .item-grid, re-applying logic:", grid);
                 applyHidingLogic(grid);
             }
         });
    }

    // Debounce mechanism to avoid excessive full document rescans.
    // If many element nodes are added rapidly, we wait for a brief pause
    // before scanning the whole document for .item-grid elements.
    let rescanTimeout = null;
    const RESCAN_DELAY_MS = 100; // Milliseconds to wait before rescanning after an element addition mutation

    // Function to trigger a debounced rescan of the document for .item-grid elements.
    function triggerDebouncedRescan() {
        clearTimeout(rescanTimeout);
        rescanTimeout = setTimeout(() => {
            console.log(`[Content Script] Debounced rescan triggered (${RESCAN_DELAY_MS}ms delay). Checking for .item-grid elements...`);
            // Query the entire document (of the current frame) for all .item-grid elements.
            const currentGrids = document.querySelectorAll('.item-grid');
            if (currentGrids.length > 0) {
               console.log(`[Content Script] Rescan found ${currentGrids.length} .item-grid elements.`);
               // Process any found grids (applies hiding, sets up grid observers if new)
               processFoundGrids(currentGrids);
            } else {
               console.log("[Content Script] Rescan found no .item-grid elements yet.");
            }
        }, RESCAN_DELAY_MS);
    }


    // --- Body MutationObserver ---
    // Create the main observer instance that watches the document body of the current frame.
    const bodyObserver = new MutationObserver(mutations => {
        // console.log("[Content Script] Body MutationObserver triggered. Processing mutations..."); // Suppress frequent log
        let elementNodesAdded = false;
        // Iterate through all mutations that occurred in this batch.
        mutations.forEach(mutation => {
            // We are primarily interested in nodes being added.
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                 // Check if any of the added nodes are element nodes.
                 mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) { // Check if it's an element node (more robust than === 1)
                        elementNodesAdded = true;
                        // We don't need complex checks on the added node itself here.
                        // If any element was added, it's reason to potentially re-scan for grids.
                    }
                });
            }
        });

        // If any element nodes were added in this mutation batch, trigger a debounced rescan.
        // This catches any DOM addition, assuming it might be related to item grids appearing.
        if (elementNodesAdded) {
            // console.log("[Content Script] Body MutationObserver: Element node(s) added. Triggering debounced rescan."); // Suppress frequent log
            triggerDebouncedRescan();
        }
    });

    // Now that DOMContentLoaded has fired, document.body is guaranteed to exist.
    // Start observing the document body (of the current frame) for added nodes and subtree changes.
    // childList: true is essential to detect direct children being added/removed from body.
    // subtree: true is essential to detect additions/removals anywhere within body's descendants.
    try {
        bodyObserver.observe(document.body, { childList: true, subtree: true });
        console.log("[Content Script] Body MutationObserver started on document.body.");
    } catch (e) {
        // Catch potential errors if document.body somehow becomes null or detached later (unlikely after DOMContentLoaded)
        console.error("[Content Script] Error starting Body MutationObserver:", e);
    }


    // Initial check for .item-grid elements right after setting up the body observer.
    // This catches any grids that are already present in the DOM when DOMContentLoaded fires.
    console.log("[Content Script] Initial check for .item-grid elements on DOMContentLoaded...");
    const initialGrids = document.querySelectorAll('.item-grid');
    if (initialGrids.length > 0) {
        console.log(`[Content Script] Initial check found ${initialGrids.length} .item-grid elements.`);
        // Process these initially found grids (applies hiding, sets up grid observers)
        processFoundGrids(initialGrids);
    } else {
        console.log("[Content Script] Initial check found no .item-grid elements on DOMContentLoaded. Relying on Body Observer for later additions.");
    }


}); // End of DOMContentLoaded listener


// Optional: Add logic to disconnect observers when the page is unloaded
// to clean up resources, especially important in single-page applications
// where the same frame might navigate without full page reload.
// You would need access to bodyObserver and gridObservers from here.
/*
window.addEventListener('unload', () => {
  console.log("[Content Script] Window unloading. Disconnecting MutationObservers.");
  if (bodyObserver) { // Check if bodyObserver was successfully created
      bodyObserver.disconnect();
  }
  // If using gridObservers Set:
  // gridObservers.forEach(obs => obs.disconnect());
  // gridObservers.clear();
});
*/


