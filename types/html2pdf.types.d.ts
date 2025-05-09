declare module "html2pdf.js" {
    interface Html2PdfOptions {
        margin: number[]
        filename: string
        image: {
            type: string
            quality: number
        }
        html2canvas: {
            scale: number
            useCORS: boolean
        }
        jsPDF: {
            unit: string
            format: string
            orientation: string
        }
    }

    interface Html2Pdf {
        set(options: Html2PdfOptions): this
        from(element: HTMLElement | string): this
        save(): Promise<void>
    }

    const html2pdf: () => Html2Pdf
    export default html2pdf
}
