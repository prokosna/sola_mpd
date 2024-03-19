import { useToast } from "@chakra-ui/react";
import { compareVersions } from "compare-versions";
import { produce } from "immer";
import React, { useCallback, useState } from "react";

import { useAppStore } from "../store/AppStore";

import { useMpdProfileManager } from "./useMpdProfileManager";

import { MpdProfile } from "@/models/mpd/mpd_profile";

export function useMpdProfileForm() {
  const profileState = useAppStore((state) => state.profileState);
  const updateProfileState = useAppStore((state) => state.updateProfileState);
  const { checkMpdProfile } = useMpdProfileManager();
  const toast = useToast();

  const [name, setName] = useState("Default");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState(6600);
  const [isValidated, setIsValidated] = useState(false);

  const [nameError, setNameError] = useState("");
  const [hostError, setHostError] = useState("");
  const [portError, setPortError] = useState("");
  const [validationError, setValidationError] = useState("");

  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidated(false);
    setName(e.target.value);
  }, []);
  const onHostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidated(false);
    setHost(e.target.value);
  }, []);
  const onPortChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidated(false);
    const numPort = parseInt(e.target.value);
    if (isNaN(numPort)) {
      setPortError("Port should be a number.");
      return;
    }
    setPort(numPort);
  }, []);

  const validate = useCallback(async () => {
    setIsValidated(false);
    if (profileState === undefined) {
      setValidationError("Still loading the app...");
      return;
    }
    if (name === "") {
      setNameError("Name is required.");
      return;
    }
    if (profileState.profiles.map((v) => v.name).includes(name)) {
      setNameError("Name is already used.");
      return;
    }
    setNameError("");
    if (host === "") {
      setHostError("Host is required.");
      return;
    }
    setHostError("");

    const profile = MpdProfile.create({
      name,
      host,
      port,
    });
    const version = await checkMpdProfile(profile);
    if (version === undefined) {
      setValidationError("Failed to connect to the server.");
      return;
    }
    if (compareVersions(version, "0.21") < 0) {
      setValidationError(
        `MPD version is ${version}: Please use 0.21 or later.`,
      );
      return;
    }
    setValidationError("");
    setIsValidated(true);
  }, [profileState, name, host, port, checkMpdProfile]);

  const submit = useCallback(async () => {
    if (profileState === undefined) {
      return;
    }
    const newProfile = MpdProfile.create({
      name,
      host,
      port,
    });
    const newProfileState = produce(profileState, (draft) => {
      draft.profiles.push(newProfile);
      if (draft.currentProfile === undefined) {
        draft.currentProfile = newProfile;
      }
    });
    await updateProfileState(newProfileState);
    toast({
      status: "success",
      title: "Profile created",
      description: `The new profile have been created.`,
    });
  }, [profileState, name, host, port, updateProfileState, toast]);

  return {
    name,
    host,
    port,
    isValidated,
    nameError,
    hostError,
    portError,
    validationError,
    onNameChange,
    onHostChange,
    onPortChange,
    validate,
    submit,
  };
}
