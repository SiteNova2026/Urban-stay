const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const siteHeader = document.querySelector(".site-header");
const footerYear = document.querySelector("#current-year");

footerYear.dateTime = String(new Date().getFullYear());
footerYear.textContent = footerYear.dateTime;

const closeNavigation = () => {
	menuToggle.setAttribute("aria-expanded", "false");
	primaryNavigation.classList.remove("is-open");
};

const scrollToHash = (hash, behavior = "smooth") => {
	const target = document.getElementById(decodeURIComponent(hash.slice(1)));

	if (!target) {
		if (!hash) window.scrollTo({ top: 0, behavior });
		return;
	}

	const headerHeight = siteHeader.getBoundingClientRect().height;
	const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight -10;

	window.scrollTo({ top: Math.max(0, targetTop), behavior });
};

menuToggle.addEventListener("click", () => {
	const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

	menuToggle.setAttribute("aria-expanded", String(!isExpanded));
	primaryNavigation.classList.toggle("is-open", !isExpanded);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
	link.addEventListener("click", (event) => {
		const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));

		if (!target) return;

		event.preventDefault();
		closeNavigation();

		if (window.location.hash !== link.hash) {
			window.history.pushState(null, "", link.hash);
		}

		const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
		scrollToHash(link.hash, behavior);
	});
});

window.addEventListener("popstate", () => scrollToHash(window.location.hash));
window.addEventListener("load", () => {
	if (window.location.hash) scrollToHash(window.location.hash, "auto");
});

document.querySelectorAll(".faq-item").forEach((item) => {
	const summary = item.querySelector("summary");
	const answer = item.querySelector(":scope > p");
	let animation;

	summary.addEventListener("click", (event) => {
		event.preventDefault();
		animation?.cancel();

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (item.open) {
			if (reducedMotion) {
				item.open = false;
				return;
			}

			const answerHeight = answer.getBoundingClientRect().height;
			animation = answer.animate(
				[
					{ height: `${answerHeight}px`, opacity: 1, overflow: "hidden" },
					{ height: "0px", opacity: 0, overflow: "hidden" },
				],
				{ duration: 240, easing: "ease-in" }
			);
			animation.onfinish = () => {
				item.open = false;
				animation = null;
			};
			return;
		}

		item.open = true;

		if (reducedMotion) return;

		const answerHeight = answer.scrollHeight;
		animation = answer.animate(
			[
				{ height: "0px", opacity: 0, overflow: "hidden" },
				{ height: `${answerHeight}px`, opacity: 1, overflow: "hidden" },
			],
			{ duration: 280, easing: "ease-out" }
		);
	});
});

const contactBindings = {
	text: document.querySelectorAll("[data-contact]"),
	links: document.querySelectorAll("[data-contact-href]"),
	sources: document.querySelectorAll("[data-contact-src]"),
};

fetch("./contact.json")
	.then((response) => {
		if (!response.ok) throw new Error(`Contact data request failed: ${response.status}`);
		return response.json();
	})
	.then((contact) => {
		contactBindings.text.forEach((element) => {
			const value = contact[element.dataset.contact];
			if (typeof value === "string") element.textContent = value;
		});

		contactBindings.links.forEach((element) => {
			const value = contact[element.dataset.contactHref];
			if (typeof value === "string") element.href = value;
		});

		contactBindings.sources.forEach((element) => {
			const value = contact[element.dataset.contactSrc];
			if (typeof value === "string") element.src = value;
		});
	})
	.catch((error) => {
		if (window.location.protocol !== "file:") console.error(error);
	});
