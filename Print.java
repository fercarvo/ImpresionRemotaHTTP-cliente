import java.awt.print.PrinterJob;
import java.io.File;

import javax.print.PrintService;
import javax.print.PrintServiceLookup;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.printing.PDFPageable;

/**
 + @author Edgar Carvajal <a href="https://fercarvo.github.io">WebSite</a>
 */
public class Print {

    public static void main(String args[]) throws Exception {

        String path = null;
        String printer = null;

        for (String var : args) {
            if (var.split("=")[0].equals("FILE_PATH"))
                path = var.split("=")[1];
            else if (var.split("=")[0].equals("PRINTER"))
                printer = var.split("=")[1];
        }

        System.out.println("Printer: "+printer);

        PDDocument document = PDDocument.load(new File(path));
        PrintService impresora = findPrintService(printer);

        if (impresora == null)
            throw new Exception("No se detecto una impresora con nombre: "+printer);

        PrinterJob job = PrinterJob.getPrinterJob();
        job.setPageable( new PDFPageable(document));
        job.setPrintService(impresora);
        job.print();
    }       

    private static PrintService findPrintService(String printerName) {
        PrintService[] printServices = PrintServiceLookup.lookupPrintServices(null, null);
        for (PrintService printService : printServices) {
            if (printService.getName().trim().equals(printerName)) {
                return printService;
            }
        }
        return null;
    }
}