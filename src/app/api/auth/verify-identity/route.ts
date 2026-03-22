import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country, typeGeneral, docId, name, titularDoc } = body;

    if (!country || !typeGeneral || !docId) {
      return NextResponse.json({ success: false, message: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (country === "Perú") {
      const token = process.env.APIS_PERU_TOKEN;
      
      if (typeGeneral === "Persona") {
        const cleanDocId = docId.trim();
        const response = await fetch(`https://dniruc.apisperu.com/api/v1/dni/${cleanDocId}?token=${token}`);
        const data = await response.json().catch(() => ({}));
        
        if (response.ok && data && data.dni === cleanDocId) {
          return NextResponse.json({ success: true, message: "Identidad verificada", data });
        }
      } else if (typeGeneral === "Empresa") {
        if (!titularDoc) {
          return NextResponse.json({ success: false, message: "Faltan datos del representante" }, { status: 400 });
        }

        const cleanDocId = docId.trim();
        const cleanTitularDoc = titularDoc.trim();

        // Consultar RUC
        const rucResponse = await fetch(`https://dniruc.apisperu.com/api/v1/ruc/${cleanDocId}?token=${token}`);
        const rucData = await rucResponse.json().catch(() => ({}));
        
        // Consultar DNI del Titular
        const dniResponse = await fetch(`https://dniruc.apisperu.com/api/v1/dni/${cleanTitularDoc}?token=${token}`);
        const dniData = await dniResponse.json().catch(() => ({}));
        
        if (rucResponse.ok && rucData && rucData.ruc === cleanDocId && 
            dniResponse.ok && dniData && dniData.dni === cleanTitularDoc) {
          return NextResponse.json({ 
            success: true, 
            message: "Empresa y representante verificados", 
            data: { empresa: rucData, titular: dniData } 
          });
        }
      }
    } 
    else if (country === "Argentina") {
      const token = process.env.APIWORKS_TOKEN;
      const baseUrl = process.env.APIWORKS_URL;
      
      // Placeholder: Como no existe una ruta exacta definida aún por documentación para DNI/CUIT,
      // construimos una simulación de validación pero usando la URL de ApiWorks para integracion futura.
      // Puedes reemplazar el fetch a la ruta exacta (ej: /cuit o /dni).
      
      /*
      // EJEMPLO FUTURO:
      const response = await fetch(`${baseUrl}/cuit/${docId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if(data && data.isValid) { ... }
      */

      if (docId.length >= 5) {
        return NextResponse.json({ success: true, message: "Validación por ApiWorks exitosa (Mock)" });
      }
    } 
    else {
      // Para otros países, mock genérico mientras se implementan sus APIs
      if (docId.length >= 5) {
        return NextResponse.json({ success: true, message: "Verificación básica exitosa" });
      }
    }

    return NextResponse.json({ success: false, message: "No se pudo verificar la identidad." }, { status: 400 });

  } catch (error) {
    console.error("Verificación API Error:", error);
    return NextResponse.json({ success: false, message: "Error interno en el servidor de verificación" }, { status: 500 });
  }
}
