import MappingGate from '@/components/site/MappingGate.jsx';

export const metadata = {
  title: 'Mapping Tool',
  description:
    'Build a node graph of identifiers, pin locations on Google Maps or OpenStreetMap, and link them — saved locally, never uploaded.',
};

export default function MappingPage() {
  return <MappingGate />;
}
