import React, { useState, useEffect } from "react";
import { useLoading } from "../context/LoadingContext";
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "../hooks/useAnimations";
import {
  AnimatedButton,
  AnimatedCard,
  AnimatedInput,
  AnimatedBadge,
  AnimatedSpinner,
  AnimatedList,
  AnimatedModal,
  AnimatedSection,
} from "../components/Animated";

/**
 * Example Component demonstrating all animations
 * Sử dụng tất cả animations và components đã tạo
 */
function AnimationShowcase() {
  const { showLoading, hideLoading } = useLoading();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulate loading medicines
  const loadMedicines = async () => {
    setLoading(true);
    showLoading("Đang tải danh sách thuốc...");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setMedicines([
      { id: 1, name: "Ibuprofen", category: "Pain Relief", price: "$5.99" },
      { id: 2, name: "Aspirin", category: "Pain Relief", price: "$3.99" },
      { id: 3, name: "Vitamin C", category: "Supplements", price: "$7.99" },
      { id: 4, name: "Antihistamine", category: "Allergy", price: "$8.99" },
      { id: 5, name: "Cough Syrup", category: "Cold & Flu", price: "$6.99" },
    ]);

    setLoading(false);
    hideLoading();
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const exampleMedicines = [
    { id: 1, name: "Paracetamol 500mg", price: "$2.99" },
    { id: 2, name: "Antibiotic Cream", price: "$4.99" },
    { id: 3, name: "Vitamin D3", price: "$6.99" },
  ];

  return (
    <AnimatedPage animation="fade-up">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <AnimatedSection animation="fade-up">
          <h1 className="text-4xl font-bold text-text mb-2">
            Animation Showcase
          </h1>
          <p className="text-muted">
            Tất cả animations và components đã được tích hợp
          </p>
        </AnimatedSection>

        {/* Buttons Section */}
        <AnimatedSection title="Animated Buttons" animation="slide-left">
          <div className="flex flex-wrap gap-4">
            <AnimatedButton variant="primary" onClick={loadMedicines}>
              Load Medicines
            </AnimatedButton>

            <AnimatedButton
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </AnimatedButton>

            <AnimatedButton
              variant="danger"
              onClick={() => showLoading("Processing...")}
            >
              Show Loading
            </AnimatedButton>

            <AnimatedButton variant="ghost">Ghost Button</AnimatedButton>

            <AnimatedButton loading={loading}>
              {loading ? "Loading..." : "Load Data"}
            </AnimatedButton>
          </div>
        </AnimatedSection>

        {/* Cards Section */}
        <AnimatedSection title="Animated Cards" animation="slide-right">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Card 1", desc: "Hover effect with smooth lift" },
              { title: "Card 2", desc: "Beautiful shadow transition" },
              { title: "Card 3", desc: "Professional appearance" },
            ].map((card, i) => (
              <StaggerItem key={i}>
                <AnimatedCard>
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {card.title}
                  </h3>
                  <p className="text-muted text-sm">{card.desc}</p>
                  <div className="mt-4 space-x-2">
                    <AnimatedBadge variant="primary">Tag 1</AnimatedBadge>
                    <AnimatedBadge variant="success">Active</AnimatedBadge>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedSection>

        {/* Input Fields Section */}
        <AnimatedSection title="Animated Input Fields" animation="fade-scale">
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Search Medicine
              </label>
              <AnimatedInput placeholder="Type medicine name..." type="text" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Description
              </label>
              <AnimatedInput placeholder="Enter description..." type="text" />
            </div>
          </div>
        </AnimatedSection>

        {/* Badges Section */}
        <AnimatedSection title="Animated Badges" animation="slide-top">
          <div className="flex flex-wrap gap-3">
            <AnimatedBadge variant="primary">Primary</AnimatedBadge>
            <AnimatedBadge variant="success">Success</AnimatedBadge>
            <AnimatedBadge variant="warning">Warning</AnimatedBadge>
            <AnimatedBadge variant="danger">Danger</AnimatedBadge>
            <AnimatedBadge variant="muted">Muted</AnimatedBadge>
          </div>
        </AnimatedSection>

        {/* Medicines List with Stagger */}
        {medicines.length > 0 && (
          <AnimatedSection
            title="Medicines List (Staggered Animation)"
            animation="fade-in-scale"
          >
            <StaggerContainer className="space-y-3">
              {medicines.map((medicine) => (
                <StaggerItem key={medicine.id}>
                  <AnimatedCard>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-text">
                          {medicine.name}
                        </h4>
                        <p className="text-sm text-muted">
                          {medicine.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {medicine.price}
                        </p>
                        <AnimatedButton
                          variant="primary"
                          className="mt-2 text-xs px-3 py-1"
                        >
                          Add to Cart
                        </AnimatedButton>
                      </div>
                    </div>
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>
        )}

        {/* Loading Spinners */}
        <AnimatedSection title="Loading Indicators" animation="fade-up">
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-muted mb-3">Small Spinner</p>
              <AnimatedSpinner size="small" text="Loading..." />
            </div>
            <div>
              <p className="text-sm text-muted mb-3">Medium Spinner</p>
              <AnimatedSpinner size="medium" text="Processing..." />
            </div>
            <div>
              <p className="text-sm text-muted mb-3">Large Spinner</p>
              <AnimatedSpinner size="large" text="Uploading..." />
            </div>
          </div>
        </AnimatedSection>

        {/* Skeleton Example */}
        <AnimatedSection title="Skeleton Loaders" animation="fade-up">
          <div className="space-y-3 max-w-sm">
            <div className="skeleton skeleton-card">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line w-2/3"></div>
            </div>
            <div className="skeleton skeleton-card">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line w-3/4"></div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Animated Modal Example */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-muted">
            This is an example modal with smooth animations.
          </p>
          <ul className="space-y-2">
            <li className="stagger-item text-sm text-text">
              ✓ Fade in & scale animation
            </li>
            <li className="stagger-item text-sm text-text">
              ✓ Beautiful overlay blur
            </li>
            <li className="stagger-item text-sm text-text">
              ✓ Smooth transitions
            </li>
          </ul>
          <div className="flex gap-2 justify-end pt-4">
            <AnimatedButton
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Confirm
            </AnimatedButton>
          </div>
        </div>
      </AnimatedModal>
    </AnimatedPage>
  );
}

export default AnimationShowcase;
