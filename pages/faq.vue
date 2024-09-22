<script setup lang="ts">
useHead({
    title: "FAQ | Ecommerce"
})
</script>

<template>
    <section class="spacer">
        <div class="container">
            <h1 class="mb-4 pb-3">F.A.Q</h1>
            <div class="row">
                <div class="col-lg-9">
                    <div class="faq-blocks">
                        <h2 class="h3 mb-4">Lorem ipsum</h2>
                        <div class="faq-container w-100">
                            <div id="faqAccordion1" class="accordion">
                                <div class="accordion-item">
                                    <h2 id="heading1-1" class="accordion-header">
                                        <button
                                            class="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapse1-1"
                                            aria-expanded="true"
                                            aria-controls="collapse1-1"
                                        >
                                            Accordion Item #1
                                        </button>
                                    </h2>

                                    <div
                                        id="collapse1-1"
                                        class="accordion-collapse collapse show"
                                        aria-labelledby="heading1-1"
                                        data-bs-parent="#faqAccordion1"
                                    >
                                        <div class="accordion-body">
                                            <strong>This is the first item's accordion body.</strong> It is shown by default, until the
                                            collapse plugin adds the appropriate classes that we use to style each element. These classes
                                            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                                            modify any of this with custom CSS or overriding our default variables. It's also worth noting
                                            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
                                            does limit overflow.
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 id="heading1-2" class="accordion-header">
                                        <button
                                            class="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapse1-2"
                                            aria-expanded="false"
                                            aria-controls="collapse1-2"
                                        >
                                            Accordion Item #2
                                        </button>
                                    </h2>

                                    <div
                                        id="collapse1-2"
                                        class="accordion-collapse collapse"
                                        aria-labelledby="heading1-2"
                                        data-bs-parent="#faqAccordion1"
                                    >
                                        <div class="accordion-body">
                                            <strong>This is the second item's accordion body.</strong> It is hidden by default, until the
                                            collapse plugin adds the appropriate classes that we use to style each element. These classes
                                            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                                            modify any of this with custom CSS or overriding our default variables. It's also worth noting
                                            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
                                            does limit overflow.
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 id="heading1-3" class="accordion-header">
                                        <button
                                            class="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapse1-3"
                                            aria-expanded="false"
                                            aria-controls="collapse1-3"
                                        >
                                            Accordion Item #3
                                        </button>
                                    </h2>

                                    <div
                                        id="collapse1-3"
                                        class="accordion-collapse collapse"
                                        aria-labelledby="heading1-3"
                                        data-bs-parent="#faqAccordion1"
                                    >
                                        <div class="accordion-body">
                                            <strong>This is the third item's accordion body.</strong> It is hidden by default, until the
                                            collapse plugin adds the appropriate classes that we use to style each element. These classes
                                            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                                            modify any of this with custom CSS or overriding our default variables. It's also worth noting
                                            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
                                            does limit overflow.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h2 class="h3 mb-4">Lorem ipsum</h2>

                        <div class="faq-container w-100">
                            <div id="faqAccordion2" class="accordion">
                                <div class="accordion-item">
                                    <h2 id="heading2-1" class="accordion-header">
                                        <button
                                            class="accordion-button"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapse2-1"
                                            aria-expanded="true"
                                            aria-controls="collapse2-1"
                                        >
                                            Accordion Item #1
                                        </button>
                                    </h2>

                                    <div
                                        id="collapse2-1"
                                        class="accordion-collapse collapse show"
                                        aria-labelledby="heading2-1"
                                        data-bs-parent="#faqAccordion2"
                                    >
                                        <div class="accordion-body">
                                            <strong>This is the first item's accordion body.</strong> It is shown by default, until the
                                            collapse plugin adds the appropriate classes that we use to style each element. These classes
                                            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                                            modify any of this with custom CSS or overriding our default variables. It's also worth noting
                                            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
                                            does limit overflow.
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 id="heading2-2" class="accordion-header">
                                        <button
                                            class="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapse2-2"
                                            aria-expanded="false"
                                            aria-controls="collapse2-2"
                                        >
                                            Accordion Item #2
                                        </button>
                                    </h2>

                                    <div
                                        id="collapse2-2"
                                        class="accordion-collapse collapse"
                                        aria-labelledby="heading2-2"
                                        data-bs-parent="#faqAccordion2"
                                    >
                                        <div class="accordion-body">
                                            <strong>This is the second item's accordion body.</strong> It is hidden by default, until the
                                            collapse plugin adds the appropriate classes that we use to style each element. These classes
                                            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                                            modify any of this with custom CSS or overriding our default variables. It's also worth noting
                                            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
                                            does limit overflow.
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 id="heading2-3" class="accordion-header">
                                        <button
                                            class="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapse2-3"
                                            aria-expanded="false"
                                            aria-controls="collapse2-3"
                                        >
                                            Accordion Item #3
                                        </button>
                                    </h2>

                                    <div
                                        id="collapse2-3"
                                        class="accordion-collapse collapse"
                                        aria-labelledby="heading2-3"
                                        data-bs-parent="#faqAccordion2"
                                    >
                                        <div class="accordion-body">
                                            <strong>This is the third item's accordion body.</strong> It is hidden by default, until the
                                            collapse plugin adds the appropriate classes that we use to style each element. These classes
                                            control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                                            modify any of this with custom CSS or overriding our default variables. It's also worth noting
                                            that just about any HTML can go within the <code>.accordion-body</code>, though the transition
                                            does limit overflow.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3">
                    <div class="contact-card">
                        <p>Didn't find an answer? <br >Get in touch</p>
                        <span>
                            Working time<br >
                            I-VII 6 - 11 p.m.
                        </span>
                        <NuxtLink href="/contact" class="btn btn-primary w-100 d-block mt-3">Get in touch</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
