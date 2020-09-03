package it.polito.ai.lab2.controllers;

import it.polito.ai.lab2.dtos.CourseDTO;
import it.polito.ai.lab2.dtos.StudentDTO;
import it.polito.ai.lab2.dtos.TeamDTO;
import it.polito.ai.lab2.dtos.VmDTO;
import it.polito.ai.lab2.exceptions.*;
import it.polito.ai.lab2.services.TeamService;
import it.polito.ai.lab2.services.VmService;
import it.polito.ai.lab2.utility.ModelHelper;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@Log(topic = "TeamController")
@RequestMapping("/API/teams")
public class TeamController {

    @Autowired
    TeamService teamService;

    @Autowired
    VmService vmService;

    @GetMapping({"", "/"})
    public List<TeamDTO> all() {
        log.info("all() called");
        return teamService.getTeams().stream()
                .map(ModelHelper::enrich)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public TeamDTO getOne(@PathVariable Long id) {
        log.info("getOne(" + id + ") called");
        return teamService.getTeam(id)
                .map(ModelHelper::enrich)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team `" + id + "` does not exist"));
    }

    @GetMapping("/{id}/members")
    public List<StudentDTO> getMembers(@PathVariable Long id) {
        log.info("getMembers(" + id + ") called");
        try {
            return teamService.getTeamMembers(id).stream()
                    .map(ModelHelper::enrich)
                    .collect(Collectors.toList());
        }catch (TeamNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/{id}/course")
    public CourseDTO getCourse(@PathVariable Long id) {
        log.info("getCourse(" + id + ") called");
        try {
            return ModelHelper.enrich(teamService.getCourseForTeam(id));
        } catch (TeamNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
/*
    @PostMapping("/{id}/createVm")
    public VmDTO createVm(@PathVariable Long id, @RequestBody VmDTO vmDTO){
        try{
            vmService.createVm()
        } catch (VmModelNotFoundException | StudentNotFoundException | CourseNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
*/
}
