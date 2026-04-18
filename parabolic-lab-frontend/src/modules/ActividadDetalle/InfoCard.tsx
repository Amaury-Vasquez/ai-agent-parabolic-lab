interface InfoCardProps {
  label: string;
  value: string | number;
}

const InfoCard = ({ label, value }: InfoCardProps) => (
  <div className="bg-base-100 rounded-md p-4">
    <p className="text-sm opacity-70">{label}</p>
    <p className="text-lg md:text-xl font-semibold">{value}</p>
  </div>
);

export default InfoCard;
