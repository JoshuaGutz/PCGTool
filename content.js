// content.js

console.log("Starting script 13 document_start and all_frames multi matches with MutationObserver...");

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
  "Friend Ball",
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
  // Add all the text contents you want to hide here
];

console.log("Starting script 00 document_start. Waiting for DOMContentLoaded to setup observer...");

// Function containing the core logic to find and hide elements
// Targets the innermost div for text content within a given scope
function applyHidingLogic(scopeElement) {
  // Select target elements (the innermost div with the text content) within the scope
  // Using the full selector path starting from a potential .item-grid or broader scope
  const textContentElements = scopeElement.querySelectorAll('.item-grid > div > .item-entry-button > span.item-entry-button__name > div');

  console.log(`Applying hiding logic within scope:`, scopeElement);
  console.log(`Found ${textContentElements.length} potential text content elements within this scope.`);

  textContentElements.forEach(textContentElement => {
    const itemTextContent = textContentElement.textContent.trim();

    // console.log("Checking item text content:", `"${itemTextContent}"`); // Quoted for clarity

    if (contentToHide.includes(itemTextContent)) {
      console.log(`Match found: "${itemTextContent}". Attempting to hide parent.`);








      // // Find the closest parent element with the class 'item-entry-button'
      // const parentItemButton = textContentElement.closest('.item-entry-button');

      // if (parentItemButton) {
      //   // Only hide if not already hidden
      //   if (parentItemButton.style.display !== 'none') {
      //       parentItemButton.style.display = 'none'; // Or visibility = 'hidden' or opacity = '0'
      //       console.log(`Action: Hidden element with text content: "${itemTextContent}"`);
      //   } else {
      //       // console.log(`Element with text content "${itemTextContent}" is already hidden.`);
      //   }
      // } else {
      //   console.log(`Warning: Parent .item-entry-button not found for element containing text: "${itemTextContent}"`);
      // }





      // Find the closest element with the class 'item-entry-button'
      const itemButton = textContentElement.closest('.item-entry-button');

      if (itemButton) {
        // Get the direct parent element of the .item-entry-button element
        const parentDivToHide = itemButton.parentElement;

        if (parentDivToHide) {
            // Check if the parent div is already hidden
            if (parentDivToHide.style.display !== 'none') {
                // parentDivToHide.style.style.display = 'none'; // Set display to none for the parent div
                parentDivToHide.style.display = 'none'; // Set display to none for the parent div
                console.log(`Action: Hidden parent div of .item-entry-button for text: "${itemTextContent}"`);
            } else {
                // console.log(`Parent div of .item-entry-button for text "${itemTextContent}" is already hidden.`);
            }
        } else {
             console.log(`Warning: Parent div of .item-entry-button not found for element containing text: "${itemTextContent}"`);
        }
      } else {
        console.log(`Warning: .item-entry-button parent not found (should not happen if structure is correct) for element containing text: "${itemTextContent}"`);
      }











    }
  });
}


// --- Main Logic: Wait for DOMContentLoaded to safely setup Body Observer ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Setting up Body MutationObserver...");


    // --- Body MutationObserver ---
    // Create an observer instance that watches the body for added nodes
    // This version watches for the addition of .item-entry-button elements directly
    const bodyObserver = new MutationObserver(mutations => {
        // console.log("Body MutationObserver triggered. Processing mutations..."); // Suppress frequent log
        mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    // Only process element nodes (type 1)
                    if (node.nodeType === 1) {

                        // **NEW CHECK:** Check if the added node IS or CONTAINS an .item-entry-button element
                        const isItemButtonRelated =
                            (node.matches && node.matches('.item-entry-button')) ||
                            node.querySelector('.item-entry-button');


                        if (isItemButtonRelated) {
                           console.log("Body Observer: Added node is or contains an .item-entry-button element. Applying hiding logic within added scope.");
                           // If an item-entry-button or its container was added, apply hiding logic
                           // specifically within the scope of this added node.
                           applyHidingLogic(node);
                        } else {
                           // console.log("Body Observer: Added element node does not seem directly item-button related:", node); // Optional: log other added nodes
                        }
                    }
                });
            }
        });
    });

    // Now that DOMContentLoaded has fired, document.body is available.
    // Start observing the document body for added nodes and subtree changes.
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    console.log("Body MutationObserver started on document.body, watching for .item-entry-button.");

    // --- FINAL DOM-BASED ATTEMPT: Delayed Scan ---
    // As a fallback, wait a short moment after DOMContentLoaded and scan the whole document.
    // This might catch elements added shortly after the observer is set up if the observer isn't triggering.
    setTimeout(() => {
        console.log("Running final delayed scan after DOMContentLoaded...");
        applyHidingLogic(document); // Apply logic to the entire document scope
        console.log("Final delayed scan finished.");

        // Optional: Disconnect the observers if you are confident the delayed scan caught everything
        // This is risky if content appears even later.
        // bodyObserver.disconnect();
        // console.log("Body MutationObserver disconnected after delayed scan.");
    }, 500); // Adjust delay (in milliseconds) as needed. 500ms is a starting point.







    // Optional: Initial check for .item-entry-button elements on DOMContentLoaded
    // in case they are present early (less likely based on previous logs, but safe).
    console.log("Initial check for .item-entry-button elements on DOMContentLoaded...");
    const initialItemButtons = document.querySelectorAll('.item-entry-button');
    if (initialItemButtons.length > 0) {
        console.log(`Initial check found ${initialItemButtons.length} .item-entry-button elements.`);
        // Apply hiding logic to the entire document scope for these initial elements
        applyHidingLogic(document); // Apply to document scope to use full selector
    } else {
        console.log("Initial check found no .item-entry-button elements on DOMContentLoaded. Relying on Body Observer.");
    }


}); // End of DOMContentLoaded listener
// ... rest of your script functions ...


// Optional: Stop observing when the page is fully unloaded
// window.addEventListener('unload', () => {
//   // Need a way to access bodyObserver from here
//   // bodyObserver.disconnect();
//   console.log("Body MutationObserver disconnected.");
// });

