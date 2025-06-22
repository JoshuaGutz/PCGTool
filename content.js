// content.js - With Troubleshooting Logs

console.log("My custom script content-log 9 at document_end is logging");

// Define the list of text contents you want to hide
const contentToHide = [
  "Basic Ball",
  "Specific Item Name 1",
  "Another Name to Hide",
  "Yet Another Item"
  // Add all the text contents you want to hide here
];

console.log("Starting script to find and hide items...");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded event fired. Running script...");

  // Your existing script logic goes here:
  // const nameElements = document.querySelectorAll(...)
  // nameElements.forEach(...)
  // ...

  // Select all potential target elements using the specific CSS selector
  const nameElements = document.querySelectorAll('.item-grid > div > .item-entry-button > span.item-entry-button__name > div');

  // const nameElements = document.querySelectorAll('.item-grid > div > .item-entry-button > span.item-entry-button__name > div');
     const nameElements = document.querySelectorAll('.item-grid > div > .item-entry-button > span.item-entry-button__name > div');
  // document.querySelectorAll('.item-grid > div > .item-entry-button > span.item-entry-button__name > div').length;
  // console.log(`Found ${nameElements.length} potential .item-entry-button__name elements.`);
  nameElements.forEach((nameElement, index) => {
    console.log(`--- Processing element ${index + 1} ---`);

    // Log the current nameElement being processed
    console.log("Current nameElement:", nameElement);

    // Get the text content of the current .item-entry-button__name element
    const itemTextContent = nameElement.textContent.trim();

    // Log the extracted text content
    console.log("Item text content:", `"${itemTextContent}"`); // Quoted to clearly show whitespace

    // Check if the item's text content is in our list of content to hide
    if (contentToHide.includes(itemTextContent)) {
      console.log(`Text content "${itemTextContent}" IS in the list to hide.`);

      // Find the closest parent element with the class 'item-entry-button'
      const parentItemButton = nameElement.closest('.item-entry-button');

      // Log the result of the closest() call
      console.log("Closest parent .item-entry-button:", parentItemButton);

      // If the parent is found, hide it
      if (parentItemButton) {
        // Option 1: Use display: none (removes the element from the layout flow)
        parentItemButton.style.display = 'none';

        // Option 2: Use visibility: hidden (hides the element but keeps its space)
        // parentItemButton.style.visibility = 'hidden';

        // Option 3: Use opacity: 0 (makes it invisible but still interactive and in flow)
        // parentItemButton.style.opacity = '0';

        console.log(`Action: Hidden element with text content: "${itemTextContent}"`);
      } else {
        console.log(`Warning: Parent .item-entry-button not found for element with text: "${itemTextContent}"`);
      }
    } else {
      console.log(`Text content "${itemTextContent}" IS NOT in the list to hide.`);
    }
  });

});

console.log("Script finished.");

// Optional: Add an observer... (kept here for completeness, but focus on the loop logs)
/*
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Check if it's an element node
          const potentialNameElements = node.querySelectorAll('.item-grid .item-entry-button .item-entry-button__name');
          potentialNameElements.forEach(nameElement => {
             const itemTextContent = nameElement.textContent.trim();
             if (contentToHide.includes(itemTextContent)) {
               const parentItemButton = nameElement.closest('.item-entry-button');
               if (parentItemButton) {
                 parentItemButton.style.display = 'none';
                 console.log(`Hidden dynamically added element with text content: "${itemTextContent}"`);
               }
             }
          });
        }
      });
    }
  });
});

// Start observing the document body for added nodes (and subtree changes)
// observer.observe(document.body, { childList: true, subtree: true });
*/