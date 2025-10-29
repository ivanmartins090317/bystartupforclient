import {create} from "zustand";
import {persist} from "zustand/middleware";
import {Database} from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Company = Database["public"]["Tables"]["companies"]["Row"];

interface UserState {
  user: Profile | null;
  company: Company | null;
  activeContractId: string | null;
  setUser: (user: Profile | null) => void;
  setCompany: (company: Company | null) => void;
  setActiveContract: (contractId: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      activeContractId: null,
      setUser: (user) => set({user}),
      setCompany: (company) => set({company}),
      setActiveContract: (contractId) => set({activeContractId: contractId}),
      clearUser: () => set({user: null, company: null, activeContractId: null})
    }),
    {
      name: "user-storage"
    }
  )
);
