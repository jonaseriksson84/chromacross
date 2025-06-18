// How to Play modal functionality with localStorage tracking

const STORAGE_KEY = 'chromacross-has-seen-tutorial';

export function initializeHowToPlayModal() {
	const modal = document.getElementById('how-to-play-modal');
	const showButton = document.getElementById('show-how-to-play');
	const closeButton = document.getElementById('close-how-to-play');
	const gotItButton = document.getElementById('got-it-button');

	if (!modal || !showButton || !closeButton || !gotItButton) {
		return;
	}

	// Check if user has seen the tutorial
	function hasSeenTutorial() {
		return localStorage.getItem(STORAGE_KEY) === 'true';
	}

	// Mark tutorial as seen
	function markTutorialAsSeen() {
		localStorage.setItem(STORAGE_KEY, 'true');
	}

	// Show modal
	function showModal() {
		modal.classList.remove('hidden');
		document.body.style.overflow = 'hidden'; // Prevent background scrolling
	}

	// Hide modal
	function hideModal() {
		modal.classList.add('hidden');
		document.body.style.overflow = ''; // Restore scrolling
	}

	// Show tutorial on first visit
	if (!hasSeenTutorial()) {
		// Small delay to let the page settle
		setTimeout(() => {
			showModal();
		}, 500);
	}

	// Event listeners
	showButton.addEventListener('click', showModal);
	
	closeButton.addEventListener('click', () => {
		markTutorialAsSeen();
		hideModal();
	});
	
	gotItButton.addEventListener('click', () => {
		markTutorialAsSeen();
		hideModal();
	});

	// Close modal when clicking outside
	modal.addEventListener('click', (event) => {
		if (event.target === modal) {
			markTutorialAsSeen();
			hideModal();
		}
	});

	// Close modal with Escape key
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
			markTutorialAsSeen();
			hideModal();
		}
	});
}