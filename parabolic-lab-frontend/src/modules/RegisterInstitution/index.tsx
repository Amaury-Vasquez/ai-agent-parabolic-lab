import Card from "@/components/Card";
import RegisterInstitutionForm from "./RegisterInstitutionForm";

const RegisterInstitution = () => (
  <div className="py-8 px-4">
    <div className="max-w-3xl mx-auto">
      <Card border>
        <h1 className="card-title text-3xl font-bold mb-2">
          Registro de Institución
        </h1>
        <p className="mb-4">
          Para registrar una institución, es necesario completar la información
          de la institución. Además de proporcionar un correo electrónico y una
          contraseña para la creación de una cuenta de administrador.
        </p>
        <RegisterInstitutionForm />
      </Card>
    </div>
  </div>
);

export default RegisterInstitution;
