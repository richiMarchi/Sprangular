package it.polito.ai.lab2.entities;

import lombok.Data;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Vm {

  @Id
  @GeneratedValue
  Long id;

  String name;

  @ManyToOne
  @JoinColumn(name = "vmModel_id")
  VmModel vmModel;

  int vCpu;

  int diskStorage;

  int ram;

  @ManyToOne
  @JoinColumn(name = "team_id")
  Team team;

  @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @JoinTable(name = "vm_owner", joinColumns = @JoinColumn(name = "vm_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
  List<Student> owners = new ArrayList<>();

  boolean active;

  String imagePath;

  public void setVmModel(VmModel vmModel) {
    this.vmModel = vmModel;
    vmModel.getVms().add(this);
  }

  public void setTeam(Team team) {
    this.team = team;
    team.getVms().add(this);
  }

  public void addOwner(Student student) {
    this.getOwners().add(student);
    student.getOwnedVms().add(this);
  }

  public void removeOwner(Student student) {
    this.getOwners().remove(student);
    student.getOwnedVms().remove(this);
  }
}
