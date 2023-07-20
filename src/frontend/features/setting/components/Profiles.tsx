"use client";
import {
  Button,
  Divider,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { IoTrash } from "react-icons/io5";

import { MpdProfileForm } from "../../global/components/MpdProfileForm";
import { useProfiles } from "../hooks/useProfiles";

import { CenterSpinner } from "@/frontend/common_ui/elements/CenterSpinner";

export default function Profiles() {
  const { profiles, deleteProfile } = useProfiles();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (profiles === undefined) {
    return <CenterSpinner></CenterSpinner>;
  }

  return (
    <>
      <VStack spacing={"12px"} align={"start"}>
        <Button onClick={onOpen}>Add</Button>
        <Divider></Divider>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>NAME</Th>
                <Th>HOST</Th>
                <Th>PORT</Th>
                <Th>ACTION</Th>
              </Tr>
            </Thead>

            <Tbody>
              {profiles.map((profile, index) => (
                <Tr key={index}>
                  <Td>{profile.name}</Td>
                  <Td>{profile.host}</Td>
                  <Td isNumeric>{profile.port}</Td>
                  {index !== 0 ? (
                    <Td>
                      <IconButton
                        variant="outline"
                        aria-label="Delete"
                        size="xs"
                        icon={<IoTrash />}
                        onClick={() => deleteProfile(profile)}
                      />
                    </Td>
                  ) : (
                    <Td></Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} size={"xl"} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={0}>
            <MpdProfileForm></MpdProfileForm>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
