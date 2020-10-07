package it.polito.ai.lab2.controllers;

import it.polito.ai.lab2.dtos.VmDTO;
import it.polito.ai.lab2.exceptions.*;
import it.polito.ai.lab2.pojos.UpdateVmDetails;
import it.polito.ai.lab2.services.VmService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.FileNotFoundException;
import java.util.Map;

@RestController
@Log(topic = "VmController")
@RequestMapping("/API/vms")
public class VmController {

  @Autowired
  VmService vmService;

  @GetMapping("/{vmId}")
  public VmDTO getVm(@PathVariable Long vmId) {
    try {
      return vmService.getVm(vmId);
    } catch (VmNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
    } catch (VmNotOfTeamException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    }
  }

  @GetMapping("/{vmId}/instance")
  public Resource getVmInstance(@PathVariable Long vmId) {
    try {
      return vmService.getVmInstance(vmId);
    } catch (VmNotFoundException | FileNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
    } catch (VmNotOfTeamException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    }
  }

  @DeleteMapping("/{vmId}")
  public VmDTO deleteVm(@PathVariable Long vmId) {
    try {
      return vmService.deleteVm(vmId);
    } catch (CannotDeleteVmException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
    } catch (VmNotOfTeamException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    }
  }

  @PutMapping("/{vmId}")
  public VmDTO updateVm(@PathVariable Long vmId, @RequestBody UpdateVmDetails uvd) {
    try {
      return vmService.updateVmResources(vmId, uvd);
    } catch (VmNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
    } catch (VmNotOfTeamException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  @PutMapping("{vmId}/turnOnVm")
  public VmDTO turnOnVm(@PathVariable Long vmId) {
    try {
      return vmService.turnOnVm(vmId);
    } catch (VmNotFoundException | TeamNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
    } catch (VmNotOfTeamException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    } catch (MaxVmResourcesException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  @PutMapping("/{vmId}/turnOffVm")
  public VmDTO turnOffVm(@PathVariable Long vmId) {
    try {
      return vmService.turnOffVm(vmId);
    } catch (VmNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
    } catch (VmNotOfTeamException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    }
  }

  @ResponseStatus(HttpStatus.OK)
  @PostMapping("/{vmId}/addOwner")
  public void addVmOwner(@PathVariable Long vmId, @RequestBody Map<String, String> reqBody) {
    try {
      vmService.addVmOwner(vmId, reqBody.get("studentId"));
    } catch (VmNotFoundException | TeamNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
    } catch (VmNotOfTeamException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    } catch (UserNotVerifiedException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }
}
