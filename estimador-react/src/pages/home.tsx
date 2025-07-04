import PropertyForm from "../components/property-form";

export default function HomePage() {

  return (
    <div id="form-background" className="w-full h-[100vh] flex flex-col justify-center items-center p-4">
      <PropertyForm className="w-full h-auto md:h-[540px] md:w-[600px]"></PropertyForm>
      <div className="flex flex-col items-center pt-8 absolute bottom-0">
        <img src="images/logo_sergio.png" width="200px" />
        <div className="text-white text-sm pt-2">Maestría en Inteligencia Artificial - 2025</div>
      </div>
    </div>
  );
}
