const medicinesProducts = [
  {
    id: 1,
    badge: "Best Seller",
    badgeColor: "amber",
    title: "Panadol Extra with Optizorb",
    description: "Box of 15 blisters x 12 tablets",
    oldPrice: "210.000đ",
    price: "185.000đ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwyil22FEQz9k6EbJnL9n7vF_P6SpodPp0REzPIs-_RczQddtSyeMlTavwEjLVxGlqNUHbWFJxlemNREWSyVMItw_VUtkk8PV3YDq_0pDdGrodkLi82Q3cDESRonPPBjD98NL0A_AX-dKvESZME5MiFY1YrPT_FmzuT1tpmBKqdwYVDX2R3i6osFAIk66fLXOYZc8DD6mwMi8Av7uatU_D1jd8zLWnyAjnWIr5xlMx2NlCHta5XlmM0qW-2nft29CBzZBIpq0CbZtI",
  },
  {
    id: 2,
    rx: true,
    title: "Amoxicillin 500mg Antibiotic",
    description: "Box of 10 blisters x 10 capsules",
    price: "85.000đ",
    consult: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC6otjg23hjWFDg784wxnEBfmFxptIexlLYtcr0FRj4E8GySwjo-7ssf_t27Hw6jv4zFiROR6120oTSI0v0EVkkuwMIOyLvcjhp1tgAOS5LM9gJV3aNGlzsarCbCMD4xhh01uHskRWas6beAhcAFyjDgctiLoubLF6hF9puZt8pnSe5sblZdNxCfjNSFb98QDiSrfxvIHgUugyrJJIgVXRUwxZc_veVO2Xn-wEfyt9bna4fbG7ntkslUwX7DryIYpZbOfRMAMSMIBTK",
  },
  {
    id: 3,
    title: "Hapacol 250 Flu Powder",
    description: "Box of 24 sachets",
    price: "42.000đ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAURnZG117_yyG_YMQUrHmGoYAGubwgwmb1zhLOSXai__DWO9bW3QGnuG1mCLmXp_7hYJI4548ziSoPGbP-a4n4bTxM3X6DxV4UTLz2amQ8gFSJv7aE6Ald5wsfAVYm82YynkZnIu7JtImFkSl8oazTEs7nEP4V8vSkzKCVRJF4SFbW-PQAGTCBy26vMUXisZ1ZBFrd404ne5ZMCuQrthjPkEQ94xl1RG6GUWkEwzkYV_GVLRmJYgzZKCWRW2zfEcAX5TfjPiMxu8SN",
  },
  {
    id: 4,
    badge: "New",
    badgeColor: "green",
    title: "Ibuprofen 400mg Pain Relief",
    description: "Bottle of 50 tablets",
    price: "95.000đ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpdpWBVYUpejpLYKJixNkj-pxEcMNHgWcWI_OgZTxlDoBmolSXDfpNMCbAZASplHPOOeLT46SxN0AcA4Mcml94FJ6gQX_Lq1papyHiirfXWcEc307IU0_FV0_qHa40hBhw660s0AhH58gc-iLdBLYS7nSM6IZybe29pgGN1b6pJZFYGBhrW2L4F5ixhWtL7i1XMCZIQ7fIUW2BCpp-kc1wPze49hJ4zs7P1UnvrNib0-_8xu2ecKB9ZQUrbuqCOdJuJkcagkgw0eiq",
  },
  {
    id: 5,
    title: "Voltaren Emulgel 20g",
    description: "Tube of 20g gel",
    price: "68.000đ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD8Tdqoqs9QJMlT_eBhDCRbEfDj0t8wEOkXzbEYvViS4iT42sS3bkQjIgiy9npOm87ijFCqSTQitRR-2zdJZUmO4bhSw8GMf9KvTmsTl9xXLkNP3w7V11RKiowlSPP_AiWO29wSgUj6Mn_ppEr06d1HP5qhvFAMsbfy2qP3FeVn3dkaTitNtCcaa_fhx1HvN4EjTRMcc8ky6vW3qC5kzE0HjTvT7MnT-hX568kwN8eiSMBLF1b5WlET9tChvT52ltP1ks5Q9Fd3mfkV",
  },
  {
    id: 6,
    rx: true,
    title: "Celebrex 200mg Capsules",
    description: "Box of 3 blisters x 10 capsules",
    price: "320.000đ",
    consult: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKb6eeIaYKlvqocUsLYSJggqgKpvhON_6uItArW6LPsckGugFOUTllhsOp4rr1Wa3gGHb1g4iwJuWG3-nbkbcgOWtYja5be8DlYBJfMhLY7Yuwd0Whp5oGSs8Q0EcofBONdvJcHlcF_4XiOXVbXAKUtuqkoZYXDbBhfNQBwGAFcJGbBH11aPIDIdpaZ27sVPiwO0WX5UB-b6aY6Nmjlbfl9u-nGGc1wvtIrfumqG-NH6bNOzG0QCPF7tQ41jw4hzrSSs0-yu5lPUBn",
  },
];

export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  const digits = priceStr.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

export default medicinesProducts;
