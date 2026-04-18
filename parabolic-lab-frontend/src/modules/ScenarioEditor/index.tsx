"use client";

import { Button, Input } from "amvasdev-ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PhysicsConfigBuilder from "@/components/PhysicsConfigBuilder";
import { DIFFICULTY_LEVELS } from "@/constants/difficultyLevels";
import { PHYSICS_DEFAULTS } from "@/constants/physicsDefaults";
import { SCENARIO_TYPES } from "@/constants/scenarioTypes";
import {
  ScenarioEditorProvider,
  useScenarioEditor,
} from "@/contexts/ScenarioEditorContext";
import type { Scenario } from "@/models/scenario";
import type { PhysicsConfig } from "@/types/physicsConfig";
import type {
  ScenarioFormData,
  ScenarioFormErrors,
} from "@/types/scenarioForm";
import InteractiveSimulator from "./InteractiveSimulator";

interface ScenarioEditorProps {
  classroomId: string;
  scenarioId?: string;
  initialData?: Scenario;
}

const ScenarioEditorForm = ({
  classroomId,
  scenarioId,
  initialData,
}: ScenarioEditorProps) => {
  const router = useRouter();
  const isEditing = Boolean(scenarioId && initialData);
  const { physicsConfig, setPhysicsConfig } = useScenarioEditor();

  const [formData, setFormData] = useState<ScenarioFormData>({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    niveldificultad: (initialData?.niveldificultad as ScenarioFormData["niveldificultad"]) || "Básico",
    tipoescenario: (initialData?.tipoescenario as ScenarioFormData["tipoescenario"]) || "Simulación",
    objetivosaprendizaje: initialData?.objetivosaprendizaje || "",
    instrucciones: initialData?.instrucciones || "",
    tiempolimite: initialData?.tiempolimite || undefined,
    intentospermitidos: initialData?.intentospermitidos || 3,
    configuracionescenario: (initialData?.configuracionescenario as ScenarioFormData["configuracionescenario"]) || {
      physics: {
        angleMin: PHYSICS_DEFAULTS.ANGLE_MIN,
        angleMax: PHYSICS_DEFAULTS.ANGLE_MAX,
        angleDefault: PHYSICS_DEFAULTS.ANGLE_DEFAULT,
        velocityMin: PHYSICS_DEFAULTS.VELOCITY_MIN,
        velocityMax: PHYSICS_DEFAULTS.VELOCITY_MAX,
        velocityDefault: PHYSICS_DEFAULTS.VELOCITY_DEFAULT,
        cannonHeight: PHYSICS_DEFAULTS.CANNON_HEIGHT_DEFAULT,
        targetDistance: PHYSICS_DEFAULTS.TARGET_DISTANCE_DEFAULT,
        targetRadius: PHYSICS_DEFAULTS.TARGET_RADIUS_DEFAULT,
        showTrajectory: true,
        showVectors: false,
        showGrid: true,
      },
    },
    activo: initialData?.activo ?? true,
  });

  const [errors, setErrors] = useState<ScenarioFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync context physics config with form data
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      configuracionescenario: {
        ...prev.configuracionescenario,
        physics: physicsConfig,
      },
    }));
  }, [physicsConfig]);

  const validateForm = (): boolean => {
    const newErrors: ScenarioFormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (formData.tiempolimite && formData.tiempolimite < 1) {
      newErrors.tiempolimite = "El tiempo límite debe ser mayor a 0";
    }

    if (formData.intentospermitidos < 1) {
      newErrors.intentospermitidos = "Debe permitir al menos 1 intento";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Implementar llamada a API
      // if (isEditing) {
      //   await updateScenario(scenarioId, formData);
      // } else {
      //   await createScenario(classroomId, formData);
      // }

      // Simulación de guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Guardando escenario:", formData);

      // Redirigir a la lista de escenarios
      router.push(`/docente/salon/${classroomId}/escenarios`);
    } catch (error) {
      console.error("Error al guardar escenario:", error);
      alert(
        "Hubo un error al guardar el escenario. Por favor, intenta de nuevo."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {isEditing ? "Editar Escenario" : "Crear Nuevo Escenario"}
        </h1>
        <p className="text-sm sm:text-base text-base-content/70">
          {isEditing
            ? "Modifica los detalles del escenario y su configuración física."
            : "Define un nuevo escenario de tiro parabólico para tus alumnos."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Información Básica */}
        <div className="bg-base-200 p-4 sm:p-6 rounded-lg space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Información Básica</h2>

          <div>
            <label className="label">
              <span className="label-text">
                Nombre del Escenario <span className="text-error">*</span>
              </span>
            </label>
            <Input
              id="nombre"
              type="text"
              placeholder="Tiro desde una colina"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.currentTarget.value })
              }
              className={errors.nombre ? "input-error" : ""}
            />
            {errors.nombre ? (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.nombre}
                </span>
              </label>
            ) : null}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Descripción</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="Un proyectil es lanzado desde una colina a cierta altura..."
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.currentTarget.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Nivel de Dificultad</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.niveldificultad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    niveldificultad: e.currentTarget
                      .value as ScenarioFormData["niveldificultad"],
                  })
                }
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Tipo de Escenario</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.tipoescenario}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipoescenario: e.target
                      .value as ScenarioFormData["tipoescenario"],
                  })
                }
              >
                {SCENARIO_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Objetivos e Instrucciones */}
        <div className="bg-base-200 p-4 sm:p-6 rounded-lg space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Objetivos e Instrucciones
          </h2>

          <div>
            <label className="label">
              <span className="label-text">Objetivos de Aprendizaje</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="Calcular el alcance horizontal, determinar la altura máxima..."
              value={formData.objetivosaprendizaje}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  objetivosaprendizaje: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Instrucciones para el Alumno</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              placeholder="Ajusta el ángulo y la velocidad inicial para alcanzar el objetivo..."
              value={formData.instrucciones}
              onChange={(e) =>
                setFormData({ ...formData, instrucciones: e.target.value })
              }
            />
          </div>
        </div>

        {/* Configuración de Límites */}
        <div className="bg-base-200 p-4 sm:p-6 rounded-lg space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Límites y Restricciones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Tiempo Límite (minutos)</span>
              </label>
              <Input
                id="tiempolimite"
                type="number"
                placeholder="30"
                value={formData.tiempolimite || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tiempolimite: e.currentTarget.value
                      ? parseInt(e.currentTarget.value)
                      : undefined,
                  })
                }
                min={1}
                className={errors.tiempolimite ? "input-error" : ""}
              />
              {errors.tiempolimite ? (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.tiempolimite}
                  </span>
                </label>
              ) : null}
              <label className="label">
                <span className="label-text-alt">
                  Dejar vacío para sin límite de tiempo
                </span>
              </label>
            </div>

            <div>
              <label className="label">
                <span className="label-text">
                  Intentos Permitidos <span className="text-error">*</span>
                </span>
              </label>
              <Input
                id="intentospermitidos"
                type="number"
                placeholder="3"
                value={formData.intentospermitidos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intentospermitidos: parseInt(e.currentTarget.value) || 1,
                  })
                }
                min={1}
                className={errors.intentospermitidos ? "input-error" : ""}
              />
              {errors.intentospermitidos ? (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.intentospermitidos}
                  </span>
                </label>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={formData.activo}
              onChange={(e) =>
                setFormData({ ...formData, activo: e.currentTarget.checked })
              }
            />
            <span className="label-text">
              Escenario activo (visible para alumnos)
            </span>
          </div>
        </div>

        {/* Vista Previa Interactiva y Configuración Física */}
        <div className="bg-base-200 p-4 sm:p-6 rounded-lg space-y-6">
          <InteractiveSimulator />
          <PhysicsConfigBuilder
            config={physicsConfig}
            onChange={setPhysicsConfig}
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving
              ? "Guardando..."
              : isEditing
              ? "Guardar Cambios"
              : "Crear Escenario"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const ScenarioEditor = (props: ScenarioEditorProps) => {
  const initialPhysicsConfig: PhysicsConfig =
    (props.initialData?.configuracionescenario?.physics as PhysicsConfig) || {
      angleMin: PHYSICS_DEFAULTS.ANGLE_MIN,
      angleMax: PHYSICS_DEFAULTS.ANGLE_MAX,
      angleDefault: PHYSICS_DEFAULTS.ANGLE_DEFAULT,
      velocityMin: PHYSICS_DEFAULTS.VELOCITY_MIN,
      velocityMax: PHYSICS_DEFAULTS.VELOCITY_MAX,
      velocityDefault: PHYSICS_DEFAULTS.VELOCITY_DEFAULT,
      cannonHeight: PHYSICS_DEFAULTS.CANNON_HEIGHT_DEFAULT,
      targetDistance: PHYSICS_DEFAULTS.TARGET_DISTANCE_DEFAULT,
      targetRadius: PHYSICS_DEFAULTS.TARGET_RADIUS_DEFAULT,
      showTrajectory: true,
      showVectors: false,
      showGrid: true,
    };

  return (
    <ScenarioEditorProvider initialConfig={initialPhysicsConfig}>
      <ScenarioEditorForm {...props} />
    </ScenarioEditorProvider>
  );
};

export default ScenarioEditor;
