<script setup lang="ts">
const isHidden = ref(false)
</script>

<template>
    <div :class="{ 'd-none': isHidden }" class="header-banner bg-primary">
        <div class="container d-flex align-items-center justify-content-between flex-wrap">
            <p class="d-flex flex-fill justify-content-center mb-0 text-white fw-semibold">Free shipping on 35 €</p>
            <button class="banner-button btn border-0 pe-0" type="button" @click="() => (isHidden = true)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M2.33841 14.8491L15.0663 2.12117C15.4569 1.73064 15.4569 1.09748 15.0663 0.706956C14.6758 0.316431 14.0426 0.316431 13.6521 0.706956L0.924195 13.4349C0.533671 13.8254 0.533671 14.4586 0.924195 14.8491C1.31472 15.2396 1.94788 15.2396 2.33841 14.8491Z"
                        fill="#ffffff"
                    />
                    <path
                        d="M15.0678 13.435L2.33992 0.707107C1.94939 0.316582 1.31623 0.316582 0.925706 0.707107C0.535181 1.09763 0.535181 1.7308 0.925706 2.12132L13.6536 14.8492C14.0442 15.2398 14.6773 15.2398 15.0678 14.8492C15.4584 14.4587 15.4584 13.8256 15.0678 13.435Z"
                        fill="#ffffff"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>
