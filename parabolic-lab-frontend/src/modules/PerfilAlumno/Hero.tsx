import { Badge } from "amvasdev-ui";
import {
  Award,
  Building2,
  Flame,
  Mail,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import type { Institucion } from "@/models/institucion";
import type { UserProfile } from "@/models/user";
import StatTile from "./StatTile";
import { getInitials, type AlumnoStats } from "./helpers";

interface HeroProps {
  user: UserProfile;
  institucion?: Institucion;
  stats: AlumnoStats;
}

const Hero = ({ user, institucion, stats }: HeroProps) => {
  const initials = getInitials(user.nombre, user.apellidopaterno);
  const fullName = [user.nombre, user.apellidopaterno, user.apellidomaterno]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-linear-to-br from-primary/15 via-base-100 to-accent/10 p-6 md:p-8 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-7 text-center md:text-left">
        <div className="avatar placeholder shrink-0">
          <div className="bg-primary text-primary-content rounded-2xl w-24 h-24 md:w-28 md:h-28 ring-4 ring-base-100 shadow-md flex items-center justify-center">
            <span className="text-3xl md:text-4xl font-bold">{initials}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight wrap-break-word">
            {fullName}
          </h2>
          <div className="flex items-center gap-2 justify-center md:justify-start text-sm opacity-80 break-all">
            <Mail size={16} className="shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start pt-1">
            <Badge variant="primary">
              <Sparkles size={14} className="mr-1" />
              <span className="capitalize">{user.tipousuario}</span>
            </Badge>
            {institucion ? (
              <Badge variant="neutral">
                <Building2 size={14} className="mr-1" />
                <span className="truncate max-w-48">{institucion.nombre}</span>
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <StatTile
          icon={<Target size={20} />}
          label="Completados"
          value={stats.totalCompletados}
          accent="success"
        />
        <StatTile
          icon={<Flame size={20} />}
          label="Intentos"
          value={stats.totalIntentos}
          accent="info"
        />
        <StatTile
          icon={<Trophy size={20} />}
          label="Mejor puntuación"
          value={stats.mejorPuntuacion ?? "—"}
          accent="warning"
        />
        <StatTile
          icon={<Award size={20} />}
          label="Promedio"
          value={stats.promedioPuntuacion ?? "—"}
          accent="primary"
        />
      </div>
    </section>
  );
};

export default Hero;
